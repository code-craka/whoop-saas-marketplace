/**
 * Stripe Checkout Session Creation API
 *
 * POST /api/checkout/create
 *
 * Creates a Stripe Checkout session with platform fees
 *
 * CRITICAL:
 * - Validates sub-merchant is onboarded
 * - Uses idempotency key
 * - Platform fee splits
 * - Records payment intent in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma, { runInTenantContext } from '@/lib/prisma';
import {
  createCheckoutSession,
  calculatePlatformFee,
  toDollars,
} from '@/lib/stripe';

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

const createCheckoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  customerEmail: z.string().email().optional(),
  successUrl: z.string().url('Invalid success URL'),
  cancelUrl: z.string().url('Invalid cancel URL'),
  metadata: z.record(z.string()).optional(),
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const data = createCheckoutSchema.parse(body);

    // Run in tenant context
    return await runInTenantContext({ companyId: data.companyId }, async () => {
      // ========================================================================
      // 1. VALIDATE COMPANY
      // ========================================================================

      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
        select: {
          id: true,
          stripe_account_id: true,
          stripe_onboarded: true,
          platform_fee_percent: true,
          status: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      if (company.status !== 'active') {
        return NextResponse.json(
          { error: 'Company is not active' },
          { status: 403 }
        );
      }

      if (!company.stripe_onboarded || !company.stripe_account_id) {
        return NextResponse.json(
          {
            error: 'Company has not completed Stripe onboarding',
            onboarding_required: true,
          },
          { status: 400 }
        );
      }

      // ========================================================================
      // 2. VALIDATE PRODUCT
      // ========================================================================

      const product = await prisma.product.findFirst({
        where: {
          id: data.productId,
          company_id: data.companyId,
          active: true,
        },
        select: {
          id: true,
          title: true,
          price_amount: true,
          price_minor_units: true,
          currency: true,
          plan_type: true,
          billing_period: true,
          trial_days: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found or inactive' },
          { status: 404 }
        );
      }

      // ========================================================================
      // 3. GENERATE IDEMPOTENCY KEY
      // ========================================================================

      const idempotencyKey = `checkout_${data.companyId}_${data.productId}_${nanoid()}`;

      // ========================================================================
      // 4. CREATE CHECKOUT SESSION
      // ========================================================================

      const session = await createCheckoutSession({
        productId: product.id,
        productName: product.title,
        priceInCents: product.price_minor_units,
        currency: product.currency,
        planType: product.plan_type as 'one_time' | 'monthly' | 'yearly',
        billingPeriod: product.billing_period || undefined,
        trialDays: product.trial_days || undefined,
        stripeAccountId: company.stripe_account_id,
        platformFeePercent: Number(company.platform_fee_percent),
        customerEmail: data.customerEmail,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: {
          company_id: data.companyId,
          product_id: product.id,
          ...(data.metadata || {}),
        },
        idempotencyKey,
      });

      // ========================================================================
      // 5. RECORD PAYMENT INTENT (if one_time)
      // ========================================================================

      if (product.plan_type === 'one_time' && session.payment_intent) {
        const platformFeeInCents = calculatePlatformFee(
          product.price_minor_units,
          Number(company.platform_fee_percent)
        );

        await prisma.payment.create({
          data: {
            company_id: data.companyId,
            amount: product.price_amount,
            amount_minor_units: product.price_minor_units,
            currency: product.currency,
            status: 'pending',
            stripe_payment_intent_id:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent.id,
            platform_fee_amount: toDollars(platformFeeInCents),
            platform_fee_minor_units: platformFeeInCents,
            checkout_metadata: {
              session_id: session.id,
              product_id: product.id,
              idempotency_key: idempotencyKey,
            },
            metadata: data.metadata || {},
          },
        });
      }

      // ========================================================================
      // 6. RETURN CHECKOUT URL
      // ========================================================================

      return NextResponse.json({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
      });
    });
  } catch (error) {
    console.error('[Checkout API] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
POST /api/checkout/create

{
  "productId": "prod_xxx",
  "companyId": "biz_xxx",
  "customerEmail": "user@example.com",
  "successUrl": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yourapp.com/cancel",
  "metadata": {
    "source": "dashboard"
  }
}

Response:
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_xxx",
  "session_id": "cs_test_xxx"
}
*/
