/**
 * Stripe Connect Onboarding - Check Status
 *
 * GET /api/onboarding/stripe/status?companyId=xxx
 *
 * Checks if a company has completed Stripe onboarding
 * Updates database if onboarding is complete
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma, { runInTenantContext } from '@/lib/prisma';
import { isConnectAccountOnboarded } from '@/lib/stripe';
import { triggerWebhook, WebhookEvents } from '@/lib/webhook-queue';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId is required' },
        { status: 400 }
      );
    }

    return await runInTenantContext({ companyId }, async () => {
      // ========================================================================
      // 1. GET COMPANY
      // ========================================================================

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
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

      if (!company.stripe_account_id) {
        return NextResponse.json({
          onboarded: false,
          status: 'not_started',
        });
      }

      // ========================================================================
      // 2. CHECK STRIPE ONBOARDING STATUS
      // ========================================================================

      const isOnboarded = await isConnectAccountOnboarded(
        company.stripe_account_id
      );

      // ========================================================================
      // 3. UPDATE DATABASE IF NEWLY ONBOARDED
      // ========================================================================

      if (isOnboarded && !company.stripe_onboarded) {
        await prisma.company.update({
          where: { id: companyId },
          data: {
            stripe_onboarded: true,
            onboarding_completed: true,
            status: 'active',
          },
        });

        // Trigger webhook
        await triggerWebhook(companyId, WebhookEvents.COMPANY_ONBOARDED, {
          company_id: companyId,
          stripe_account_id: company.stripe_account_id,
        });

        console.log(`[Stripe Onboarding] Company ${companyId} onboarded`);
      }

      // ========================================================================
      // 4. RETURN STATUS
      // ========================================================================

      return NextResponse.json({
        onboarded: isOnboarded,
        status: isOnboarded ? 'complete' : 'pending',
        stripe_account_id: company.stripe_account_id,
      });
    });
  } catch (error) {
    console.error('[Stripe Onboarding Status] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to check onboarding status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
