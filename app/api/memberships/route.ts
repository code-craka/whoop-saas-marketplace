/**
 * Memberships API - List
 *
 * GET /api/memberships - List all memberships
 *
 * NOTE: Memberships are created through the checkout flow,
 * so there's no POST endpoint here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// GET /api/memberships - List Memberships
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');
    const userId = searchParams.get('user_id'); // Filter by specific user
    const productId = searchParams.get('product_id'); // Filter by product
    const status = searchParams.get('status'); // Filter by status
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Determine access level
    let isCompanyAdmin = false;

    if (companyId) {
      // Verify user has access to this company
      const companyUser = await prisma.companyUser.findFirst({
        where: {
          company_id: companyId,
          user_id: user.id,
        },
      });

      if (!companyUser) {
        return NextResponse.json(
          { error: 'You do not have access to this company' },
          { status: 403 }
        );
      }

      isCompanyAdmin = ['owner', 'admin'].includes(companyUser.role);
    }

    // Build where clause
    const where: Prisma.MembershipWhereInput = {};

    if (companyId) {
      where.company_id = companyId;
    } else {
      // If no company_id, only show user's own memberships
      where.user_id = user.id;
    }

    // Apply filters (only if user is company admin or filtering their own)
    if (userId) {
      if (!isCompanyAdmin && userId !== user.id) {
        return NextResponse.json(
          { error: 'You can only view your own memberships' },
          { status: 403 }
        );
      }
      where.user_id = userId;
    }

    if (productId) {
      where.product_id = productId;
    }

    if (status) {
      where.status = status as Prisma.EnumMembershipStatusFilter;
    }

    // Query memberships
    let memberships;
    let total;

    if (companyId) {
      // Use tenant isolation for company queries
      memberships = await runInTenantContext({ companyId }, async () => {
        return await prisma.membership.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar_url: true,
              },
            },
            product: {
              select: {
                id: true,
                title: true,
                price_amount: true,
                currency: true,
                plan_type: true,
              },
            },
            company: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });
      });

      total = await runInTenantContext({ companyId }, async () => {
        return await prisma.membership.count({ where });
      });
    } else {
      // Regular query for user's own memberships
      memberships = await prisma.membership.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price_amount: true,
              currency: true,
              plan_type: true,
            },
          },
          company: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      total = await prisma.membership.count({ where });
    }

    return NextResponse.json({
      memberships,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Memberships API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}
