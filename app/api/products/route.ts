/**
 * Products API - List & Create
 *
 * GET /api/products - List all products for a company
 * POST /api/products - Create a new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createProductSchema = z.object({
  company_id: z.string().cuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional(),

  // Pricing (provide EITHER price_amount OR price_minor_units, not both)
  price_amount: z.number().positive().optional(), // Dollars (e.g., 49.99)
  price_minor_units: z.number().int().positive().optional(), // Cents (e.g., 4999)
  currency: z.string().length(3).default('USD'),

  // Plan Type
  plan_type: z.enum(['one_time', 'monthly', 'yearly']),
  billing_period: z.number().int().positive().optional(), // Days (30, 365, etc.)

  // Trial
  trial_days: z.number().int().min(0).default(0),

  // Status
  active: z.boolean().default(true),

  // Metadata
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// GET /api/products - List Products
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
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'You do not have access to this company' },
        { status: 403 }
      );
    }

    // Query products with tenant isolation
    const products = await runInTenantContext({ companyId }, async () => {
      const where: Prisma.ProductWhereInput = {};

      if (activeOnly) {
        where.active = true;
      }

      return await prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              memberships: true,
            },
          },
        },
      });
    });

    // Get total count
    const total = await runInTenantContext({ companyId }, async () => {
      const where: Prisma.ProductWhereInput = {};
      if (activeOnly) {
        where.active = true;
      }
      return await prisma.product.count({ where });
    });

    return NextResponse.json({
      products,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('[Products API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/products - Create Product
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // Validate request
    const validation = createProductSchema.safeParse(body);
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
        { error: 'You do not have permission to create products for this company' },
        { status: 403 }
      );
    }

    // Calculate price in minor units (CRITICAL: avoid floating-point errors)
    let priceMinorUnits: number;

    if (data.price_minor_units !== undefined) {
      // Use provided minor units
      priceMinorUnits = data.price_minor_units;
    } else if (data.price_amount !== undefined) {
      // Convert dollars to cents
      priceMinorUnits = Math.round(data.price_amount * 100);
    } else {
      return NextResponse.json(
        { error: 'Either price_amount or price_minor_units is required' },
        { status: 400 }
      );
    }

    const priceAmount = priceMinorUnits / 100;

    // Create product with tenant isolation
    const product = await runInTenantContext(
      { companyId: data.company_id },
      async () => {
        return await prisma.product.create({
          data: {
            company_id: data.company_id,
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            price_amount: priceAmount,
            price_minor_units: priceMinorUnits,
            currency: data.currency,
            plan_type: data.plan_type,
            billing_period: data.billing_period,
            trial_days: data.trial_days,
            active: data.active,
            metadata: data.metadata as Prisma.JsonObject | undefined,
          },
        });
      }
    );

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('[Products API] POST error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
