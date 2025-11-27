/**
 * Stripe Client & Helpers
 *
 * Stripe Connect integration for multi-tenant marketplace
 *
 * CRITICAL:
 * - ALL amounts in minor units (cents)
 * - Platform fee splits via application_fee_amount
 * - Idempotency keys on ALL mutations
 *
 * @see CLAUDE.md for payment patterns
 */

import Stripe from 'stripe';
import { z } from 'zod';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const stripeEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'Invalid Stripe secret key'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .startsWith('whsec_', 'Invalid Stripe webhook secret'),
  STRIPE_CONNECT_CLIENT_ID: z.string().startsWith('ca_', 'Invalid Stripe Connect client ID').optional().default('ca_placeholder'),
  BASE_URL: z.string().url('Invalid BASE_URL').optional().default('http://localhost:3000'),
});

const stripeEnv = stripeEnvSchema.parse({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID,
  BASE_URL: process.env.BASE_URL,
});

// ============================================================================
// STRIPE CLIENT
// ============================================================================

/**
 * Singleton Stripe client
 */
export const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// ============================================================================
// MONEY CONVERSION
// ============================================================================

/**
 * Convert dollars to cents (minor units)
 *
 * CRITICAL: Always use this for money conversion
 * Prevents floating-point errors
 *
 * @param amount - Amount in dollars (e.g., 99.99)
 * @returns Amount in cents (e.g., 9999)
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to dollars
 *
 * @param amount - Amount in cents (e.g., 9999)
 * @returns Amount in dollars (e.g., 99.99)
 */
export function toDollars(amount: number): number {
  return amount / 100;
}

// ============================================================================
// PLATFORM FEE CALCULATION
// ============================================================================

/**
 * Calculate platform fee amount
 *
 * @param amountInCents - Total amount in cents
 * @param feePercent - Platform fee percentage (e.g., 5.0 for 5%)
 * @returns Platform fee in cents
 */
export function calculatePlatformFee(
  amountInCents: number,
  feePercent: number
): number {
  return Math.round((amountInCents * feePercent) / 100);
}

/**
 * Calculate merchant payout (after platform fee)
 *
 * @param amountInCents - Total amount in cents
 * @param feePercent - Platform fee percentage
 * @returns Merchant receives this amount
 */
export function calculateMerchantPayout(
  amountInCents: number,
  feePercent: number
): number {
  const platformFee = calculatePlatformFee(amountInCents, feePercent);
  return amountInCents - platformFee;
}

// ============================================================================
// CHECKOUT SESSION CREATION
// ============================================================================

export interface CreateCheckoutSessionOptions {
  productId: string;
  productName: string;
  priceInCents: number;
  currency: string;
  planType: 'one_time' | 'monthly' | 'yearly';
  billingPeriod?: number; // Days
  trialDays?: number;

  // Sub-merchant (company)
  stripeAccountId: string;
  platformFeePercent: number;

  // Customer
  customerEmail?: string;

  // URLs
  successUrl: string;
  cancelUrl: string;

  // Metadata
  metadata?: Record<string, string>;

  // Idempotency
  idempotencyKey: string;
}

/**
 * Create Stripe Checkout Session with platform fees
 *
 * CRITICAL PATTERN:
 * - Uses Stripe Connect (sub-merchant receives payment)
 * - Platform fee via application_fee_amount
 * - Idempotency key prevents duplicate charges
 *
 * @param options - Checkout configuration
 * @returns Stripe Checkout Session
 */
export async function createCheckoutSession(
  options: CreateCheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const {
    productId,
    productName,
    priceInCents,
    currency,
    planType,
    trialDays,
    stripeAccountId,
    platformFeePercent,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata,
    idempotencyKey,
  } = options;

  // Calculate platform fee
  const platformFeeInCents = calculatePlatformFee(
    priceInCents,
    platformFeePercent
  );

  // Create line items based on plan type
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (planType === 'one_time') {
    // One-time payment
    lineItems.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: productName,
          metadata: {
            product_id: productId,
          },
        },
        unit_amount: priceInCents,
      },
      quantity: 1,
    });
  } else {
    // Subscription (monthly/yearly)
    const interval = planType === 'monthly' ? 'month' : 'year';

    lineItems.push({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: productName,
          metadata: {
            product_id: productId,
          },
        },
        unit_amount: priceInCents,
        recurring: {
          interval,
          interval_count: 1,
        },
      },
      quantity: 1,
    });
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create(
    {
      mode: planType === 'one_time' ? 'payment' : 'subscription',
      line_items: lineItems,

      // Stripe Connect - charge sub-merchant account
      payment_intent_data:
        planType === 'one_time'
          ? {
              application_fee_amount: platformFeeInCents,
              transfer_data: {
                destination: stripeAccountId,
              },
            }
          : undefined,

      subscription_data:
        planType !== 'one_time'
          ? {
              application_fee_percent: platformFeePercent,
              trial_period_days: trialDays || undefined,
            }
          : undefined,

      // Customer
      customer_email: customerEmail,

      // URLs
      success_url: successUrl,
      cancel_url: cancelUrl,

      // Metadata
      metadata: {
        product_id: productId,
        plan_type: planType,
        ...(metadata || {}),
      },

      // Compliance
      consent_collection: {
        terms_of_service: 'required',
      },
    },
    {
      // CRITICAL: Idempotency key prevents duplicate charges
      idempotencyKey,
      // Use connected account
      stripeAccount: stripeAccountId,
    }
  );

  return session;
}

// ============================================================================
// STRIPE CONNECT - ONBOARDING
// ============================================================================

export interface CreateConnectAccountOptions {
  companyId: string;
  email: string;
  businessName: string;
  country?: string;
}

/**
 * Create Stripe Connect account for sub-merchant
 *
 * Used during company onboarding
 *
 * @param options - Account configuration
 * @returns Stripe Account
 */
export async function createConnectAccount(
  options: CreateConnectAccountOptions
): Promise<Stripe.Account> {
  const { companyId, email, businessName, country = 'US' } = options;

  const account = await stripe.accounts.create({
    type: 'express', // Stripe Express (recommended)
    country,
    email,
    business_type: 'company',
    company: {
      name: businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      company_id: companyId,
    },
  });

  return account;
}

/**
 * Create Stripe Connect onboarding link
 *
 * @param accountId - Stripe account ID
 * @param refreshUrl - URL to return to if onboarding expires
 * @param returnUrl - URL to return to after onboarding
 * @returns Onboarding link URL
 */
export async function createConnectOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

/**
 * Check if Connect account is fully onboarded
 *
 * @param accountId - Stripe account ID
 * @returns true if onboarded and can accept payments
 */
export async function isConnectAccountOnboarded(
  accountId: string
): Promise<boolean> {
  const account = await stripe.accounts.retrieve(accountId);

  return (
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true
  );
}

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

/**
 * Verify Stripe webhook signature
 *
 * SECURITY CRITICAL:
 * - Always verify webhook signatures
 * - Prevents unauthorized webhook calls
 *
 * @param payload - Raw webhook body (string)
 * @param signature - Stripe-Signature header
 * @returns Verified Stripe event
 */
export function verifyStripeWebhook(
  payload: string,
  signature: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeEnv.STRIPE_WEBHOOK_SECRET
    );

    return event;
  } catch (error) {
    console.error('[Stripe] Webhook verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default stripe;
export { stripeEnv };
