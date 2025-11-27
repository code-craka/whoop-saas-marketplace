/**
 * Stripe Connect Onboarding - Create Account
 *
 * POST /api/onboarding/stripe/create
 *
 * Creates a Stripe Connect Express account for a sub-merchant
 * Returns onboarding link for KYC completion
 *
 * CRITICAL:
 * - Company must not already have Stripe account
 * - Creates Express account (easiest for merchants)
 * - Generates onboarding link with 24h expiration
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma, { runInTenantContext } from '@/lib/prisma';
import {
  createConnectAccount,
  createConnectOnboardingLink,
} from '@/lib/stripe';

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

const createOnboardingSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
});

// ============================================================================
// API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = createOnboardingSchema.parse(body);

    return await runInTenantContext({ companyId }, async () => {
      // ========================================================================
      // 1. VALIDATE COMPANY
      // ========================================================================

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          title: true,
          email: true,
          stripe_account_id: true,
          stripe_onboarded: true,
          status: true,
        },
      });

      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      // Check if already has Stripe account
      if (company.stripe_account_id) {
        // If already onboarded, return error
        if (company.stripe_onboarded) {
          return NextResponse.json(
            { error: 'Company already onboarded to Stripe' },
            { status: 400 }
          );
        }

        // If account exists but not onboarded, create new onboarding link
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const onboardingUrl = await createConnectOnboardingLink(
          company.stripe_account_id,
          `${baseUrl}/dashboard/${companyId}/onboarding/stripe/refresh`,
          `${baseUrl}/dashboard/${companyId}/onboarding/stripe/complete`
        );

        // Update expiration
        await prisma.company.update({
          where: { id: companyId },
          data: {
            onboarding_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          },
        });

        return NextResponse.json({
          success: true,
          onboarding_url: onboardingUrl,
          account_id: company.stripe_account_id,
        });
      }

      // ========================================================================
      // 2. CREATE STRIPE CONNECT ACCOUNT
      // ========================================================================

      const account = await createConnectAccount({
        companyId: company.id,
        email: company.email,
        businessName: company.title,
        country: 'US', // TODO: Make configurable
      });

      // ========================================================================
      // 3. CREATE ONBOARDING LINK
      // ========================================================================

      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      const onboardingUrl = await createConnectOnboardingLink(
        account.id,
        `${baseUrl}/dashboard/${companyId}/onboarding/stripe/refresh`,
        `${baseUrl}/dashboard/${companyId}/onboarding/stripe/complete`
      );

      // ========================================================================
      // 4. UPDATE COMPANY RECORD
      // ========================================================================

      await prisma.company.update({
        where: { id: companyId },
        data: {
          stripe_account_id: account.id,
          stripe_onboarded: false,
          onboarding_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
          status: 'pending_kyc',
        },
      });

      // ========================================================================
      // 5. RETURN ONBOARDING LINK
      // ========================================================================

      return NextResponse.json({
        success: true,
        onboarding_url: onboardingUrl,
        account_id: account.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    });
  } catch (error) {
    console.error('[Stripe Onboarding] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create Stripe onboarding',
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
POST /api/onboarding/stripe/create

{
  "companyId": "biz_xxx"
}

Response:
{
  "success": true,
  "onboarding_url": "https://connect.stripe.com/setup/s/xxx",
  "account_id": "acct_xxx",
  "expires_at": "2024-01-15T12:00:00.000Z"
}
*/
