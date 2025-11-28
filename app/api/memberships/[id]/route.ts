/**
 * Memberships API - Single Membership Operations
 *
 * GET /api/memberships/[id] - Get a membership by ID
 * PUT /api/memberships/[id] - Update a membership (cancel, update metadata)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateMembershipSchema = z.object({
  // Status updates
  status: z.enum(['active', 'canceled', 'past_due', 'expired', 'trialing']).optional(),

  // Cancellation
  cancel_at: z.string().datetime().optional().nullable(),

  // Metadata
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getMembershipWithAccess(membershipId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatar_url: true,
        },
      },
      product: true,
      company: true,
    },
  });

  if (!membership) {
    return { error: 'Membership not found', status: 404, membership: null };
  }

  // Check if user owns this membership OR is company admin
  const isOwner = membership.user_id === userId;

  const companyUser = await prisma.companyUser.findFirst({
    where: {
      company_id: membership.company_id,
      user_id: userId,
    },
  });

  const isCompanyAdmin = companyUser && ['owner', 'admin'].includes(companyUser.role);

  if (!isOwner && !isCompanyAdmin) {
    return {
      error: 'You do not have access to this membership',
      status: 403,
      membership: null,
    };
  }

  return {
    error: null,
    status: 200,
    membership,
    isOwner,
    isCompanyAdmin: !!isCompanyAdmin,
  };
}

// ============================================================================
// GET /api/memberships/[id] - Get Membership
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const { error, status, membership } = await getMembershipWithAccess(id, user.id);

    if (error || !membership) {
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json(membership);
  } catch (error) {
    console.error('[Memberships API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch membership' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/memberships/[id] - Update Membership
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
    const validation = updateMembershipSchema.safeParse(body);
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

    // Get membership and verify access
    const { error, status, membership, isOwner, isCompanyAdmin } =
      await getMembershipWithAccess(id, user.id);

    if (error || !membership) {
      return NextResponse.json({ error }, { status });
    }

    // Prepare update data
    const updateData: Prisma.MembershipUpdateInput = {};

    // Status changes
    if (data.status !== undefined) {
      // Only company admins can change status directly
      if (!isCompanyAdmin) {
        return NextResponse.json(
          { error: 'Only company admins can change membership status' },
          { status: 403 }
        );
      }

      updateData.status = data.status;

      // If canceling, set canceled_at timestamp
      if (data.status === 'canceled') {
        updateData.canceled_at = new Date();
      }
    }

    // Cancellation scheduling
    if (data.cancel_at !== undefined) {
      // Members can cancel their own memberships
      if (!isOwner && !isCompanyAdmin) {
        return NextResponse.json(
          { error: 'You do not have permission to cancel this membership' },
          { status: 403 }
        );
      }

      updateData.cancel_at = data.cancel_at ? new Date(data.cancel_at) : null;

      // If canceling immediately, also update status
      if (data.cancel_at === null) {
        updateData.status = 'canceled';
        updateData.canceled_at = new Date();
      }
    }

    // Metadata updates
    if (data.metadata !== undefined) {
      // Only company admins can update metadata
      if (!isCompanyAdmin) {
        return NextResponse.json(
          { error: 'Only company admins can update membership metadata' },
          { status: 403 }
        );
      }

      updateData.metadata = data.metadata === null ? Prisma.JsonNull : (data.metadata as Prisma.JsonObject | undefined);
    }

    // Update membership with tenant isolation
    const updatedMembership = await runInTenantContext(
      { companyId: membership.company_id },
      async () => {
        return await prisma.membership.update({
          where: { id },
          data: updateData,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar_url: true,
              },
            },
            product: true,
            company: true,
          },
        });
      }
    );

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error('[Memberships API] PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update membership' },
      { status: 500 }
    );
  }
}
