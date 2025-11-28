/**
 * Products API - Single Product Operations
 *
 * GET /api/products/[id] - Get a product by ID
 * PUT /api/products/[id] - Update a product
 * DELETE /api/products/[id] - Delete a product (soft delete - set active=false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, Prisma, runInTenantContext } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateProductSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable(),

  // Pricing
  price_amount: z.number().positive().optional(),
  price_minor_units: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),

  // Plan Type
  plan_type: z.enum(['one_time', 'monthly', 'yearly']).optional(),
  billing_period: z.number().int().positive().optional().nullable(),

  // Trial
  trial_days: z.number().int().min(0).optional(),

  // Status
  active: z.boolean().optional(),

  // Metadata
  metadata: z.record(z.unknown()).optional().nullable(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getProductWithAccess(productId: string, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { company: true },
  });

  if (!product) {
    return { error: 'Product not found', status: 404, product: null };
  }

  // Verify user has access to this company
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      company_id: product.company_id,
      user_id: userId,
    },
  });

  if (!companyUser) {
    return { error: 'You do not have access to this product', status: 403, product: null };
  }

  return { error: null, status: 200, product };
}

// ============================================================================
// GET /api/products/[id] - Get Product
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const { error, status, product } = await getProductWithAccess(id, user.id);

    if (error || !product) {
      return NextResponse.json({ error }, { status });
    }

    // Return product with membership count
    const productWithStats = await runInTenantContext(
      { companyId: product.company_id },
      async () => {
        return await prisma.product.findUnique({
          where: { id },
          include: {
            _count: {
              select: {
                memberships: true,
              },
            },
          },
        });
      }
    );

    return NextResponse.json(productWithStats);
  } catch (error) {
    console.error('[Products API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT /api/products/[id] - Update Product
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
    const validation = updateProductSchema.safeParse(body);
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

    // Get product and verify access
    const { error, status, product } = await getProductWithAccess(id, user.id);

    if (error || !product) {
      return NextResponse.json({ error }, { status });
    }

    // Verify user has admin/owner access
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        company_id: product.company_id,
        user_id: user.id,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'You do not have permission to update this product' },
        { status: 403 }
      );
    }

    // Calculate new price in minor units if price changed
    let updateData: Prisma.ProductUpdateInput = {};

    if (data.price_minor_units !== undefined) {
      updateData.price_minor_units = data.price_minor_units;
      updateData.price_amount = data.price_minor_units / 100;
    } else if (data.price_amount !== undefined) {
      const priceMinorUnits = Math.round(data.price_amount * 100);
      updateData.price_minor_units = priceMinorUnits;
      updateData.price_amount = data.price_amount;
    }

    // Add other fields
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.plan_type !== undefined) updateData.plan_type = data.plan_type;
    if (data.billing_period !== undefined) updateData.billing_period = data.billing_period;
    if (data.trial_days !== undefined) updateData.trial_days = data.trial_days;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.metadata !== undefined) updateData.metadata = data.metadata === null ? Prisma.JsonNull : (data.metadata as Prisma.JsonObject | undefined);

    // Update product with tenant isolation
    const updatedProduct = await runInTenantContext(
      { companyId: product.company_id },
      async () => {
        return await prisma.product.update({
          where: { id },
          data: updateData,
        });
      }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('[Products API] PUT error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/products/[id] - Delete Product (Soft Delete)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Get product and verify access
    const { error, status, product } = await getProductWithAccess(id, user.id);

    if (error || !product) {
      return NextResponse.json({ error }, { status });
    }

    // Verify user has owner access (only owners can delete)
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        company_id: product.company_id,
        user_id: user.id,
        role: 'owner',
      },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'Only company owners can delete products' },
        { status: 403 }
      );
    }

    // Check if product has active memberships
    const activeMembershipsCount = await runInTenantContext(
      { companyId: product.company_id },
      async () => {
        return await prisma.membership.count({
          where: {
            product_id: id,
            status: 'active',
          },
        });
      }
    );

    if (activeMembershipsCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete product with active memberships',
          active_memberships: activeMembershipsCount,
        },
        { status: 400 }
      );
    }

    // Soft delete: Set active to false instead of hard delete
    const deletedProduct = await runInTenantContext(
      { companyId: product.company_id },
      async () => {
        return await prisma.product.update({
          where: { id },
          data: { active: false },
        });
      }
    );

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    console.error('[Products API] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
