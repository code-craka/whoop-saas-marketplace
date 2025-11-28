/**
 * Companies API - List & Create
 *
 * GET /api/companies - List all companies for authenticated user
 * POST /api/companies - Create a new company
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createCompanySchema = z.object({
  title: z.string().min(1).max(255),
  email: z.string().email(),
  type: z.enum(['platform', 'sub_merchant']).default('sub_merchant'),

  // Optional fields
  logo_url: z.string().url().optional(),
  website_url: z.string().url().optional(),
  description: z.string().optional(),

  // Platform fees (optional, defaults to 5%)
  platform_fee_percent: z.number().min(0).max(100).default(5.0),

  // Payout settings (optional)
  payout_minimum_amount: z.number().min(0).default(50.0),
  payout_frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),

  // Metadata
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// GET /api/companies - List Companies
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role'); // Filter by role
    const typeFilter = searchParams.get('type'); // Filter by type
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build where clause
    const where: Prisma.CompanyUserWhereInput = {
      user_id: user.id,
    };

    if (role) {
      where.role = role;
    }

    // Get companies through CompanyUser relationship
    const companyUsers = await prisma.companyUser.findMany({
      where,
      include: {
        company: {
          include: {
            _count: {
              select: {
                products: true,
                memberships: true,
                payments: true,
                users: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' },
    });

    // Filter by company type if specified
    let companies = companyUsers.map(cu => ({
      ...cu.company,
      user_role: cu.role,
    }));

    if (typeFilter) {
      companies = companies.filter(c => c.type === typeFilter);
    }

    // Get total count
    const total = await prisma.companyUser.count({ where });

    return NextResponse.json({
      companies,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Companies API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/companies - Create Company
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request
    const validation = createCompanySchema.safeParse(body);
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

    // Check if email is already in use
    const existingCompany = await prisma.company.findUnique({
      where: { email: data.email },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this email already exists' },
        { status: 409 }
      );
    }

    // Generate unique slug from title
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let slugCounter = 1;

    // Ensure slug is unique
    while (await prisma.company.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create company and assign user as owner (atomic transaction)
    const company = await prisma.$transaction(async (tx) => {
      // Create company
      const newCompany = await tx.company.create({
        data: {
          title: data.title,
          email: data.email,
          slug,
          type: data.type,
          logo_url: data.logo_url,
          website_url: data.website_url,
          description: data.description,
          platform_fee_percent: data.platform_fee_percent,
          payout_minimum_amount: data.payout_minimum_amount,
          payout_frequency: data.payout_frequency,
          status: 'active',
          metadata: data.metadata as Prisma.JsonObject | undefined,
        },
      });

      // Assign creating user as owner
      await tx.companyUser.create({
        data: {
          user_id: user.id,
          company_id: newCompany.id,
          role: 'owner',
        },
      });

      return newCompany;
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('[Companies API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}
