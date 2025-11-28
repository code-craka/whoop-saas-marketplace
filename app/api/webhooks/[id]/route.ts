/**
 * Webhooks API - Single Webhook Operations
 *
 * GET /api/webhooks/[id] - Get a webhook by ID
 * PUT /api/webhooks/[id] - Update a webhook (URL, events, status)
 * DELETE /api/webhooks/[id] - Delete a webhook subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

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

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
  api_version: z.string().optional(),
  active: z.boolean().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getWebhookWithAccess(webhookId: string, userId: string) {
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
    include: {
      company: true,
      _count: {
        select: {
          deliveries: true,
        },
      },
    },
  });

  if (!webhook) {
    return { error: 'Webhook not found', status: 404, webhook: null };
  }

  // Verify user has admin access to this company
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      company_id: webhook.company_id,
      user_id: userId,
      role: { in: ['owner', 'admin'] },
    },
  });

  if (!companyUser) {
    return {
      error: 'You do not have access to this webhook',
      status: 403,
      webhook: null,
    };
  }

  return { error: null, status: 200, webhook };
}

// ============================================================================
// GET /api/webhooks/[id] - Get Webhook
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const { error, status, webhook } = await getWebhookWithAccess(id, user.id);

    if (error || !webhook) {
      return NextResponse.json({ error }, { status });
    }

    // Mask secret (only show first 8 chars)
    return NextResponse.json({
      ...webhook,
      secret: `${webhook.secret.substring(0, 8)}...`,
    });
  } catch (error) {
    console.error('[Webhooks API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch webhook' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/webhooks/[id] - Update Webhook
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate request
    const validation = updateWebhookSchema.safeParse(body);
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

    // Get webhook and verify access
    const { error, status, webhook } = await getWebhookWithAccess(id, user.id);

    if (error || !webhook) {
      return NextResponse.json({ error }, { status });
    }

    // Update webhook with tenant isolation
    const updatedWebhook = await runInTenantContext(
      { companyId: webhook.company_id },
      async () => {
        return await prisma.webhook.update({
          where: { id },
          data: {
            url: data.url,
            events: data.events,
            api_version: data.api_version,
            active: data.active,
          },
        });
      }
    );

    // Mask secret in response
    return NextResponse.json({
      ...updatedWebhook,
      secret: `${updatedWebhook.secret.substring(0, 8)}...`,
    });
  } catch (error) {
    console.error('[Webhooks API] PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update webhook' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/webhooks/[id] - Delete Webhook
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Get webhook and verify access
    const { error, status, webhook } = await getWebhookWithAccess(id, user.id);

    if (error || !webhook) {
      return NextResponse.json({ error }, { status });
    }

    // Delete webhook with tenant isolation
    await runInTenantContext({ companyId: webhook.company_id }, async () => {
      return await prisma.webhook.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      message: 'Webhook deleted successfully',
      id,
    });
  } catch (error) {
    console.error('[Webhooks API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
