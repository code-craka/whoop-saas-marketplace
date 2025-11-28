/**
 * Companies API - Single Company Operations
 *
 * GET /api/companies/[id] - Get a company by ID
 * PUT /api/companies/[id] - Update a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateCompanySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  logo_url: z.string().url().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),

  // Platform fees
  platform_fee_percent: z.number().min(0).max(100).optional(),

  // Payout settings
  payout_minimum_amount: z.number().min(0).optional(),
  payout_frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),

  // Status
  status: z.enum(['active', 'pending_kyc', 'suspended', 'closed']).optional(),

  // Metadata
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getCompanyWithAccess(companyId: string, userId: string) {
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      company_id: companyId,
      user_id: userId,
    },
    include: {
      company: {
        include: {
          _count: {
            select: {
              products: true,
              memberships: true,
              payments: true,
              users: true,
              apps: true,
              webhooks: true,
            },
          },
        },
      },
    },
  });

  if (!companyUser) {
    return {
      error: 'Company not found or you do not have access',
      status: 404,
      companyUser: null,
    };
  }

  return { error: null, status: 200, companyUser };
}

// ============================================================================
// GET /api/companies/[id] - Get Company
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const { error, status, companyUser } = await getCompanyWithAccess(id, user.id);

    if (error || !companyUser) {
      return NextResponse.json({ error }, { status });
    }

    return NextResponse.json({
      ...companyUser.company,
      user_role: companyUser.role,
    });
  } catch (error) {
    console.error('[Companies API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/companies/[id] - Update Company
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
    const validation = updateCompanySchema.safeParse(body);
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

    // Get company and verify access
    const { error, status, companyUser } = await getCompanyWithAccess(id, user.id);

    if (error || !companyUser) {
      return NextResponse.json({ error }, { status });
    }

    // Only owner and admin can update company
    if (!['owner', 'admin'].includes(companyUser.role)) {
      return NextResponse.json(
        { error: 'You do not have permission to update this company' },
        { status: 403 }
      );
    }

    // Email uniqueness check if email is being updated
    if (data.email && data.email !== companyUser.company.email) {
      const existingCompany = await prisma.company.findUnique({
        where: { email: data.email },
      });

      if (existingCompany) {
        return NextResponse.json(
          { error: 'A company with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: Prisma.CompanyUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.logo_url !== undefined) updateData.logo_url = data.logo_url;
    if (data.website_url !== undefined) updateData.website_url = data.website_url;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.platform_fee_percent !== undefined) {
      updateData.platform_fee_percent = data.platform_fee_percent;
    }
    if (data.payout_minimum_amount !== undefined) {
      updateData.payout_minimum_amount = data.payout_minimum_amount;
    }
    if (data.payout_frequency !== undefined) {
      updateData.payout_frequency = data.payout_frequency;
    }
    if (data.status !== undefined) {
      // Only owners can change status
      if (companyUser.role !== 'owner') {
        return NextResponse.json(
          { error: 'Only company owners can change company status' },
          { status: 403 }
        );
      }
      updateData.status = data.status;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata === null ? Prisma.JsonNull : (data.metadata as Prisma.JsonObject | undefined);
    }

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('[Companies API] PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  }
}
