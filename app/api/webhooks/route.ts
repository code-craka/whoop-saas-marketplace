/**
 * Webhooks API - List & Create
 *
 * GET /api/webhooks - List all webhook subscriptions
 * POST /api/webhooks - Create a new webhook subscription
 *
 * NOTE: This is for webhook subscriptions, not webhook delivery.
 * Stripe webhook endpoint is at /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { randomBytes } from 'crypto';

// ============================================================================
// WEBHOOK EVENTS
// ============================================================================

const WEBHOOK_EVENTS = [
  'payment.succeeded',
  'payment.failed',
  'membership.created',
  'membership.updated',
  'membership.canceled',
  'product.created',
  'product.updated',
  'product.deleted',
] as const;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createWebhookSchema = z.object({
  company_id: z.string().cuid(),
  url: z.string().url(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1),
  api_version: z.string().default('v1'),
  active: z.boolean().default(true),
});

// ============================================================================
// GET /api/webhooks - List Webhooks
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const activeOnly = searchParams.get('active') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        company_id: companyId,
        user_id: user.id,
        role: { in: ['owner', 'admin'] }, // Only admins can view webhooks
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'You do not have access to this company or insufficient permissions' },
        { status: 403 }
      );
    }

    // Query webhooks with tenant isolation
    const webhooks = await runInTenantContext({ companyId }, async () => {
      return await prisma.webhook.findMany({
        where: activeOnly ? { active: true } : {},
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              deliveries: true,
            },
          },
        },
      });
    });

    // Hide secrets in response (only show first 8 chars)
    const webhooksWithMaskedSecrets = webhooks.map(webhook => ({
      ...webhook,
      secret: `${webhook.secret.substring(0, 8)}...`,
    }));

    // Get total count
    const total = await runInTenantContext({ companyId }, async () => {
      return await prisma.webhook.count({
        where: activeOnly ? { active: true } : {},
      });
    });

    return NextResponse.json({
      webhooks: webhooksWithMaskedSecrets,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Webhooks API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhooks' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/webhooks - Create Webhook
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request
    const validation = createWebhookSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify user has admin/owner access to this company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        company_id: data.company_id,
        user_id: user.id,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'You do not have permission to create webhooks for this company' },
        { status: 403 }
      );
    }

    // Generate webhook secret (64 character random string)
    const secret = `whsec_${randomBytes(32).toString('hex')}`;

    // Create webhook with tenant isolation
    const webhook = await runInTenantContext(
      { companyId: data.company_id },
      async () => {
        return await prisma.webhook.create({
          data: {
            company_id: data.company_id,
            url: data.url,
            events: data.events,
            api_version: data.api_version,
            secret,
            active: data.active,
          },
        });
      }
    );

    return NextResponse.json(
      {
        ...webhook,
        // Return full secret only on creation (so user can save it)
        secret,
        warning: 'Save this secret securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Webhooks API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create webhook' },
      { status: 500 }
    );
  }
}
