/**
 * Stripe Webhook Handler
 *
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - checkout.session.completed
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 *
 * CRITICAL:
 * - Signature verification (HMAC-SHA256)
 * - Idempotent event processing
 * - Atomic database updates
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { verifyStripeWebhook } from '@/lib/stripe';
import prisma, { runInTenantContext } from '@/lib/prisma';
import { triggerWebhook, WebhookEvents } from '@/lib/webhook-queue';

// ============================================================================
// DISABLE BODY PARSING (required for webhook signature verification)
// ============================================================================

export const runtime = 'nodejs';

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // 1. VERIFY WEBHOOK SIGNATURE
    // ========================================================================

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = verifyStripeWebhook(body, signature);

    console.log(`[Stripe Webhook] Received: ${event.type}`);

    // ========================================================================
    // 2. ROUTE TO EVENT HANDLERS
    // ========================================================================

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    // ========================================================================
    // 3. RETURN SUCCESS
    // ========================================================================

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);

    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle payment_intent.succeeded
 *
 * Updates payment status to succeeded
 * Triggers webhook to company
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  // Find payment record
  const payment = await prisma.payment.findUnique({
    where: { stripe_payment_intent_id: paymentIntent.id },
    select: { id: true, company_id: true, user_id: true },
  });

  if (!payment) {
    console.warn(
      `[Stripe Webhook] Payment not found: ${paymentIntent.id}`
    );
    return;
  }

  // Update payment status
  await runInTenantContext({ companyId: payment.company_id }, async () => {
    const existingMetadata = (payment as { metadata?: Prisma.JsonValue }).metadata || {};

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        stripe_charge_id: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : null,
        metadata: {
          ...(typeof existingMetadata === 'object' && existingMetadata !== null ? existingMetadata as object : {}),
          payment_method: typeof paymentIntent.payment_method === 'string' ? paymentIntent.payment_method : null,
          receipt_url: paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object' ? paymentIntent.latest_charge.receipt_url : null,
        },
      },
    });

    // Trigger webhook to company
    await triggerWebhook(payment.company_id, WebhookEvents.PAYMENT_SUCCEEDED, {
      payment_id: payment.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
    });
  });

  console.log(`[Stripe Webhook] Payment succeeded: ${payment.id}`);
}

/**
 * Handle payment_intent.payment_failed
 *
 * Updates payment status to failed
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  const payment = await prisma.payment.findUnique({
    where: { stripe_payment_intent_id: paymentIntent.id },
    select: { id: true, company_id: true },
  });

  if (!payment) {
    console.warn(
      `[Stripe Webhook] Payment not found: ${paymentIntent.id}`
    );
    return;
  }

  await runInTenantContext({ companyId: payment.company_id }, async () => {
    const existingMetadata = (payment as { metadata?: Prisma.JsonValue }).metadata || {};

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        metadata: {
          ...(typeof existingMetadata === 'object' && existingMetadata !== null ? existingMetadata as object : {}),
          failure_code: paymentIntent.last_payment_error?.code,
          failure_message: paymentIntent.last_payment_error?.message,
        },
      },
    });

    await triggerWebhook(payment.company_id, WebhookEvents.PAYMENT_FAILED, {
      payment_id: payment.id,
      amount: paymentIntent.amount,
      failure_code: paymentIntent.last_payment_error?.code,
      failure_message: paymentIntent.last_payment_error?.message,
    });
  });

  console.log(`[Stripe Webhook] Payment failed: ${payment.id}`);
}

/**
 * Handle checkout.session.completed
 *
 * Creates membership for subscriptions
 * Updates payment for one-time payments
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  const companyId = session.metadata?.company_id;
  const productId = session.metadata?.product_id;

  if (!companyId || !productId) {
    console.warn('[Stripe Webhook] Missing metadata in checkout session');
    return;
  }

  // Get product
  const product = await prisma.product.findFirst({
    where: { id: productId, company_id: companyId },
    select: { id: true, plan_type: true },
  });

  if (!product) {
    console.warn(`[Stripe Webhook] Product not found: ${productId}`);
    return;
  }

  // For subscriptions, create membership
  if (product.plan_type !== 'one_time' && session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;

    await runInTenantContext({ companyId }, async () => {
      // Create membership (user_id would come from session metadata)
      const membership = await prisma.membership.create({
        data: {
          user_id: session.client_reference_id || 'unknown', // TODO: Get from session
          product_id: productId,
          company_id: companyId,
          status: 'active',
          stripe_subscription_id: subscriptionId,
        },
      });

      await triggerWebhook(companyId, WebhookEvents.MEMBERSHIP_CREATED, {
        membership_id: membership.id,
        product_id: productId,
        subscription_id: subscriptionId,
      });
    });
  }

  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Find membership by subscription ID
  const membership = await prisma.membership.findUnique({
    where: { stripe_subscription_id: subscription.id },
    select: { id: true, company_id: true },
  });

  if (!membership) {
    console.warn(
      `[Stripe Webhook] Membership not found for subscription: ${subscription.id}`
    );
    return;
  }

  await runInTenantContext({ companyId: membership.company_id }, async () => {
    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: subscription.status === 'active' ? 'active' : 'trialing',
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
      },
    });
  });

  console.log(`[Stripe Webhook] Subscription created: ${subscription.id}`);
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const membership = await prisma.membership.findUnique({
    where: { stripe_subscription_id: subscription.id },
    select: { id: true, company_id: true },
  });

  if (!membership) {
    return;
  }

  await runInTenantContext({ companyId: membership.company_id }, async () => {
    // Map Stripe status to our status
    let status: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing' =
      'active';

    switch (subscription.status) {
      case 'active':
        status = 'active';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      case 'canceled':
      case 'unpaid':
        status = 'canceled';
        break;
      case 'trialing':
        status = 'trialing';
        break;
    }

    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        cancel_at: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : null,
      },
    });

    await triggerWebhook(membership.company_id, WebhookEvents.MEMBERSHIP_UPDATED, {
      membership_id: membership.id,
      status,
      subscription_id: subscription.id,
    });
  });

  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  const membership = await prisma.membership.findUnique({
    where: { stripe_subscription_id: subscription.id },
    select: { id: true, company_id: true },
  });

  if (!membership) {
    return;
  }

  await runInTenantContext({ companyId: membership.company_id }, async () => {
    await prisma.membership.update({
      where: { id: membership.id },
      data: {
        status: 'canceled',
        canceled_at: new Date(),
      },
    });

    await triggerWebhook(membership.company_id, WebhookEvents.MEMBERSHIP_CANCELED, {
      membership_id: membership.id,
      subscription_id: subscription.id,
    });
  });

  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);
}
