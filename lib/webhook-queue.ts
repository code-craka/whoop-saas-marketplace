/**
 * Webhook Delivery System (Next.js 16 Compatible)
 *
 * Synchronous webhook delivery with:
 * - Exponential backoff retry (5s → 25s → 125s)
 * - Idempotency via event_id deduplication
 * - Signature generation (HMAC-SHA256)
 * - Database-backed delivery tracking
 *
 * Note: Replaced Bull queue with synchronous delivery for Next.js 16 + Turbopack compatibility
 * For production scale, consider: Inngest, Trigger.dev, Upstash QStash, or Vercel Cron
 *
 * @see CLAUDE.md for webhook patterns
 */

import crypto from 'crypto';
import prisma, { type Prisma } from './prisma';

// ============================================================================
// WEBHOOK JOB DATA
// ============================================================================

export interface WebhookJobData {
  webhookId: string;
  deliveryId: string;
  eventId: string;
  eventType: string;
  eventData: Prisma.JsonObject;
  url: string;
  secret: string;
  attempt: number;
}

// ============================================================================
// WEBHOOK SIGNATURE
// ============================================================================

/**
 * Generate webhook signature using HMAC-SHA256
 *
 * Format: sha256=<hex_digest>
 *
 * @param payload - Stringified JSON payload
 * @param secret - Webhook secret
 * @returns Signature in format "sha256=..."
 */
export function generateWebhookSignature(
  payload: string,
  secret: string
): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return `sha256=${digest}`;
}

/**
 * Verify webhook signature
 *
 * @param payload - Stringified JSON payload
 * @param signature - Signature from header
 * @param secret - Webhook secret
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================================================
// WEBHOOK DELIVERY
// ============================================================================

/**
 * Deliver webhook to endpoint with retry logic
 *
 * @param job - Webhook job data
 * @param maxAttempts - Maximum retry attempts (default: 3)
 */
async function deliverWebhook(
  job: WebhookJobData,
  maxAttempts: number = 3
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const payload = JSON.stringify({
    event_id: job.eventId,
    event_type: job.eventType,
    data: job.eventData,
    timestamp: new Date().toISOString(),
  });

  const signature = generateWebhookSignature(payload, job.secret);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(job.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': job.eventType,
          'X-Webhook-Event-ID': job.eventId,
          'User-Agent': 'Whop-Webhook/1.0',
        },
        body: payload,
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      // Update delivery record
      await prisma.webhookDelivery.update({
        where: { id: job.deliveryId },
        data: {
          status: response.ok ? 'delivered' : 'failed',
          response_status: response.status,
          response_body: await response.text().catch(() => null),
          attempts: attempt,
          delivered_at: response.ok ? new Date() : null,
        },
      });

      if (response.ok) {
        console.log(
          `[Webhook] Delivered ${job.eventType} to ${job.url} (attempt ${attempt})`
        );
        return { success: true, statusCode: response.status };
      }

      // Non-2xx response - log and potentially retry
      console.warn(
        `[Webhook] Failed ${job.eventType} to ${job.url}: ${response.status} (attempt ${attempt}/${maxAttempts})`
      );

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          statusCode: response.status,
          error: `Client error: ${response.status}`,
        };
      }

      // Exponential backoff for retries (5s, 25s, 125s)
      if (attempt < maxAttempts) {
        const delay = Math.pow(5, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(
        `[Webhook] Error delivering ${job.eventType} to ${job.url}:`,
        error
      );

      // Update delivery record on error
      await prisma.webhookDelivery.update({
        where: { id: job.deliveryId },
        data: {
          status: 'failed',
          attempts: attempt,
          response_body: error instanceof Error ? error.message : String(error),
        },
      });

      // Retry on network/timeout errors
      if (attempt < maxAttempts) {
        const delay = Math.pow(5, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  }

  return { success: false, error: 'Max attempts reached' };
}

// ============================================================================
// QUEUE WEBHOOK DELIVERY
// ============================================================================

export interface QueueWebhookOptions {
  companyId: string;
  eventType: string;
  eventData: Prisma.JsonObject;
  eventId?: string; // Optional: auto-generated if not provided
}

/**
 * Queue webhook delivery for all subscribed webhooks
 *
 * IDEMPOTENCY:
 * - Uses event_id for deduplication
 * - Prevents duplicate webhook deliveries
 *
 * Note: Now delivers synchronously. For async processing at scale, migrate to:
 * - Inngest (recommended for serverless)
 * - Trigger.dev (workflow automation)
 * - Upstash QStash (HTTP-based queue)
 * - Vercel Cron + database queue
 *
 * @param options - Webhook event options
 */
export async function queueWebhookDelivery(
  options: QueueWebhookOptions
): Promise<void> {
  const { companyId, eventType, eventData } = options;

  // Generate event_id for deduplication
  const eventId =
    options.eventId ||
    `evt_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

  // Find all active webhooks subscribed to this event
  const webhooks = await prisma.webhook.findMany({
    where: {
      company_id: companyId,
      active: true,
      events: {
        has: eventType,
      },
    },
  });

  if (webhooks.length === 0) {
    console.log(`[Webhook Queue] No webhooks for ${eventType}`);
    return;
  }

  // Create delivery records and deliver webhooks
  const deliveryPromises = webhooks.map(async (webhook: {
    id: string;
    url: string;
    secret: string;
  }) => {
    try {
      // Check for duplicate event_id (idempotency)
      const existingDelivery = await prisma.webhookDelivery.findFirst({
        where: {
          webhook_id: webhook.id,
          event_id: eventId,
        },
      });

      if (existingDelivery) {
        console.log(
          `[Webhook Queue] Skipping duplicate event: ${eventId} for webhook ${webhook.id}`
        );
        return;
      }

      // Create delivery record
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhook_id: webhook.id,
          event_id: eventId,
          event_type: eventType,
          event_data: eventData,
          status: 'pending',
          attempts: 0,
        },
      });

      // Deliver webhook immediately (async in background)
      const job: WebhookJobData = {
        webhookId: webhook.id,
        deliveryId: delivery.id,
        eventId,
        eventType,
        eventData,
        url: webhook.url,
        secret: webhook.secret,
        attempt: 0,
      };

      // Deliver in background (don't await to avoid blocking)
      deliverWebhook(job).catch((error) => {
        console.error(
          `[Webhook Queue] Background delivery failed for webhook ${webhook.id}:`,
          error
        );
      });

      console.log(
        `[Webhook Queue] Triggered ${eventType} for webhook ${webhook.id}`
      );
    } catch (error) {
      console.error(
        `[Webhook Queue] Failed to queue webhook ${webhook.id}:`,
        error
      );
    }
  });

  // Wait for all delivery records to be created (but not actual delivery)
  await Promise.allSettled(deliveryPromises);
}

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

/**
 * Standard webhook event types
 */
export const WebhookEvents = {
  // Payment events
  PAYMENT_SUCCEEDED: 'payment.succeeded',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Membership events
  MEMBERSHIP_CREATED: 'membership.created',
  MEMBERSHIP_UPDATED: 'membership.updated',
  MEMBERSHIP_CANCELED: 'membership.canceled',
  MEMBERSHIP_EXPIRED: 'membership.expired',

  // License events
  LICENSE_CREATED: 'license.created',
  LICENSE_ACTIVATED: 'license.activated',
  LICENSE_DEACTIVATED: 'license.deactivated',

  // Company events
  COMPANY_ONBOARDED: 'company.onboarded',
  COMPANY_UPDATED: 'company.updated',
} as const;

export type WebhookEventType =
  (typeof WebhookEvents)[keyof typeof WebhookEvents];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Trigger webhook event (convenience wrapper)
 *
 * @param companyId - Company ID
 * @param eventType - Event type (use WebhookEvents)
 * @param eventData - Event payload
 */
export async function triggerWebhook(
  companyId: string,
  eventType: WebhookEventType,
  eventData: Prisma.JsonObject
): Promise<void> {
  await queueWebhookDelivery({
    companyId,
    eventType,
    eventData,
  });
}

// ============================================================================
// BACKWARDS COMPATIBILITY (for worker processes)
// ============================================================================

/**
 * Gracefully close webhook queue
 * (No-op for compatibility - was used with Bull)
 */
export async function closeWebhookQueue(): Promise<void> {
  console.log('[Webhook Queue] No queue to close (using sync delivery)');
}

// Legacy export for compatibility
export const webhookQueue = null;
export default null;
