/**
 * Webhook Queue System with Bull & Redis
 *
 * Asynchronous webhook delivery with:
 * - Exponential backoff retry (5s → 25s → 125s)
 * - Idempotency via event_id deduplication
 * - Signature generation (HMAC-SHA256)
 * - Persistent job queue
 *
 * @see CLAUDE.md for webhook patterns
 */

import Bull from 'bull';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from './prisma';
import { Prisma } from '@prisma/client';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const redisConfigSchema = z.object({
  REDIS_URL: z.string().url('Invalid REDIS_URL'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
});

const redisEnv = redisConfigSchema.parse({
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});

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
// WEBHOOK QUEUE
// ============================================================================

/**
 * Bull queue for webhook delivery
 *
 * Configuration:
 * - Exponential backoff: 5s, 25s, 125s
 * - Max 3 attempts
 * - Persistent jobs (survives server restart)
 */
export const webhookQueue = new Bull<WebhookJobData>('webhooks', redisEnv.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s → 25s → 125s
    },
    removeOnComplete: true, // Remove after 24h
    removeOnFail: false, // Keep failed jobs for debugging
  },
});

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

  // Create delivery records and queue jobs
  for (const webhook of webhooks) {
    try {
      // Check for duplicate event_id (idempotency)
      const existingDelivery = await prisma.webhookDelivery.findUnique({
        where: { event_id: eventId },
      });

      if (existingDelivery) {
        console.log(
          `[Webhook Queue] Skipping duplicate event: ${eventId} for webhook ${webhook.id}`
        );
        continue;
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

      // Queue job for async delivery
      await webhookQueue.add({
        webhookId: webhook.id,
        deliveryId: delivery.id,
        eventId,
        eventType,
        eventData,
        url: webhook.url,
        secret: webhook.secret,
        attempt: 0,
      });

      console.log(
        `[Webhook Queue] Queued ${eventType} for webhook ${webhook.id}`
      );
    } catch (error) {
      console.error(
        `[Webhook Queue] Failed to queue webhook ${webhook.id}:`,
        error
      );
    }
  }
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
// QUEUE EVENT HANDLERS
// ============================================================================

// Log queue events
webhookQueue.on('completed', (job) => {
  console.log(`[Webhook Queue] Job ${job.id} completed`);
});

webhookQueue.on('failed', (job, err) => {
  console.error(`[Webhook Queue] Job ${job?.id} failed:`, err);
});

webhookQueue.on('stalled', (job) => {
  console.warn(`[Webhook Queue] Job ${job.id} stalled`);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Gracefully close webhook queue
 * Call this on server shutdown
 */
export async function closeWebhookQueue(): Promise<void> {
  await webhookQueue.close();
  console.log('[Webhook Queue] Closed');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default webhookQueue;
