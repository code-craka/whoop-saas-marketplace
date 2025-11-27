# Whop SaaS Marketplace - Copilot Instructions

## Project Overview

A production-grade multi-tenant marketplace platform ($400M Whop.com clone) enabling creators to monetize digital products. Built with Next.js 15, Prisma, Stripe Connect, and Whop SDK.

**Stack:** Next.js 15 (App Router) • Prisma + PostgreSQL • Stripe Connect • Bull/Redis • Whop SDK • Tailwind v4 • TypeScript

## Architecture Patterns

### 1. Multi-Tenant Isolation (CRITICAL)

**Automatic tenant filtering via Prisma middleware** (`lib/prisma.ts`):
- AsyncLocalStorage stores current `companyId` context
- Middleware auto-injects `company_id` on all tenant-scoped models
- Models requiring isolation: `Product`, `Membership`, `Payment`, `Webhook`, `WebhookDelivery`, `App`, `CompanyUser`

**Usage pattern:**
```typescript
import { runInTenantContext } from '@/lib/prisma';

// Wrap ALL tenant-scoped operations
await runInTenantContext({ companyId }, async () => {
  const products = await prisma.product.findMany(); // Auto-filtered by company_id
});
```

**NEVER query tenant models without context** - causes cross-tenant data leakage.

### 2. Money Handling (NEVER use floats)

**ALL amounts in minor units (cents)** to avoid floating-point errors:
```typescript
import { toCents, calculatePlatformFee } from '@/lib/stripe';

const priceInCents = toCents(99.99); // 9999 ✓
const fee = calculatePlatformFee(priceInCents, 5.0); // 5% platform fee

// WRONG: const price = 49.99; ❌
```

**Database schema uses dual fields:**
- `price_amount` (Decimal) - human-readable
- `price_minor_units` (Int) - Stripe operations

### 3. Authentication Patterns

**Password-based auth** (`lib/auth.ts`):
```typescript
import { requireAuth, getCurrentSession } from '@/lib/auth';

// Protect server components/actions
const user = await requireAuth(); // Redirects to /login if not authenticated

// Check session without redirect
const session = await getCurrentSession(); // Returns null if not logged in
```

**Whop iframe authentication** (B2C experiences):
```typescript
import { verifyWhopToken, getWhopUser } from '@/lib/whop-sdk';

// SECURITY: Use official SDK - NEVER manually parse JWT
const tokenData = await verifyWhopToken(token);
const whopUser = await getWhopUser(tokenData.userId);
```

**Access control helpers:**
```typescript
import { checkCompanyAccess, requireCompanyAccess } from '@/lib/auth';

// Check access (returns boolean)
const hasAccess = await checkCompanyAccess(userId, companyId, 'admin');

// Require access (throws error)
const companyUser = await requireCompanyAccess(userId, companyId, 'owner');
```

### 4. Stripe Connect Integration

**Platform fee splits** (`lib/stripe.ts`):
```typescript
import { createCheckoutSession } from '@/lib/stripe';

const session = await createCheckoutSession({
  productId,
  productName: 'Premium Plan',
  priceInCents: 9999, // $99.99
  planType: 'monthly',
  stripeAccountId: company.stripe_account_id!, // Sub-merchant
  platformFeePercent: 5.0, // 5% platform fee
  idempotencyKey: `checkout_${userId}_${productId}_${Date.now()}`, // CRITICAL
  successUrl, cancelUrl, metadata,
});
```

**Idempotency keys prevent duplicate charges** - include on ALL mutations.

### 5. Async Webhook Delivery

**Queue webhooks with Bull** (`lib/webhook-queue.ts`):
```typescript
import { queueWebhookDelivery } from '@/lib/webhook-queue';

// Queue webhook (non-blocking)
await queueWebhookDelivery({
  companyId,
  eventType: 'payment.succeeded',
  eventData: { payment_id, amount, currency, user_id },
});

// Worker process handles:
// - HMAC-SHA256 signature generation
// - Exponential backoff (5s → 25s → 125s)
// - 3 retry attempts
// - Response logging
```

**NEVER send webhooks synchronously** - causes timeouts and blocks request handlers.

## Development Workflows

### Commands (Ask Before Running)

```bash
# Development (Turbopack)
pnpm dev              # Start dev server

# Database
pnpm db:push          # Sync schema (development)
pnpm db:migrate       # Create migration (production)
pnpm db:studio        # GUI explorer

# Quality Checks
pnpm lint             # ESLint
npx tsc --noEmit      # Type checking

# Background Worker
pnpm worker           # Start webhook delivery worker
```

**Phase completion checklist:**
1. `pnpm lint && npx tsc --noEmit` (fix ALL errors)
2. Test locally
3. Commit only after passing

### Environment Variables

**Required for local dev:**
```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="min-32-chars-secure-secret"
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Whop SDK
WHOP_API_KEY="apik_..."
WHOP_APP_ID="app_..."
WHOP_WEBHOOK_SECRET="whsec_..."

# Redis (for webhooks)
REDIS_URL="redis://localhost:6379"

# Email (Resend)
RESEND_API_KEY="re_..."

# OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Project-Specific Conventions

### TypeScript Rules (MANDATORY)

❌ **NEVER use `any` or `unknown`**
✅ **USE explicit types:** `Prisma.JsonValue`, `Prisma.JsonObject` for JSON fields
✅ **ALL function parameters/returns typed**

Example:
```typescript
// WRONG ❌
async function updateProduct(data: any) { ... }

// CORRECT ✓
async function updateProduct(data: {
  id: string;
  title: string;
  priceInCents: number;
}): Promise<Product> { ... }
```

### Tailwind v4 Specifics

❌ **NO `tailwind.config.ts`** - not needed in v4
✅ **Configure in `app/globals.css`** via `@theme` directive

**Design system:**
- Primary: `#00ff9d` (Electric Mint) - cyberpunk/neon theme
- Accent: `#ff006e` (Hot Magenta)
- Fonts: Sora (headings), JetBrains Mono (code/labels)
- Animations: `slideInUp`, `glow`, `float`, `pulse-glow`

### API Route Patterns

**Standard structure:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, runInTenantContext } from '@/lib/prisma';

const bodySchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    
    return await runInTenantContext({ companyId }, async () => {
      const product = await prisma.product.create({
        data: { ...body, price_minor_units: toCents(body.price) }
      });
      return NextResponse.json(product);
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Server Actions Pattern

**File: `app/actions/auth.ts`**
```typescript
'use server';
import { cookies } from 'next/headers';
import { loginUser, createSessionToken } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  try {
    const session = await loginUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
    
    const token = createSessionToken(session);
    (await cookies()).set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Critical Files Reference

**Core Infrastructure:**
- `lib/prisma.ts` - Tenant isolation middleware
- `lib/auth.ts` - Authentication & authorization
- `lib/stripe.ts` - Stripe Connect helpers
- `lib/whop-sdk/index.ts` - Official Whop SDK integration
- `lib/webhook-queue.ts` - Async webhook delivery
- `middleware.ts` - Security headers & rate limiting

**Database:**
- `prisma/schema.prisma` - 13 models, 5 enums, multi-tenant schema

**Auth Flow:**
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `app/actions/auth.ts` - Server actions (login/register/logout)
- `components/login-form.tsx` - Reusable login form

**Dashboard:**
- `app/dashboard/page.tsx` - Company selector (lists user's companies)
- `app/dashboard/[companyId]/page.tsx` - Company dashboard with stats

**Experiences (B2C):**
- `app/experiences/[experienceId]/page.tsx` - Iframe-embedded content

**Webhooks:**
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler

## Security Checklist

**ALWAYS:**
✅ Cents for money (NEVER floats)
✅ Idempotency keys on mutations
✅ Tenant context on queries
✅ HMAC signatures on webhooks (SDK)
✅ Zod validation on inputs
✅ HTTP-only secure cookies
✅ Official Whop SDK (NEVER manual JWT parsing)

**NEVER:**
❌ Floating-point money
❌ Skip signature verification
❌ Query tenant models without context
❌ Synchronous webhooks
❌ `any` types
❌ Store passwords in plaintext
❌ Use `request.ip` (use `x-forwarded-for` header instead)

## Common Pitfalls

1. **Forgetting tenant context** → Cross-tenant data leak
   - Fix: Wrap in `runInTenantContext()`

2. **Using dollars instead of cents** → Rounding errors
   - Fix: Use `toCents()` helper

3. **Missing idempotency keys** → Duplicate charges
   - Fix: Generate unique key per operation

4. **Synchronous webhooks** → Timeouts
   - Fix: Use `queueWebhookDelivery()`

5. **Manual JWT parsing** → Security vulnerability
   - Fix: Use `verifyWhopToken()` from SDK

## Implementation Status

**✅ Completed:**
- Phase 1-3: Infrastructure, Auth, Payments
- Phase 5: App Ecosystem & Security
- Phase 6: Authentication & UI (landing page, OAuth, email verification, profile management)

**📋 Ready for Next Phase:**
- Production deployment (Vercel + Neon + Redis)
- Webhook worker deployment (Railway)
- Stripe Connect onboarding flow
- Additional product CRUD endpoints

## Useful Patterns

**Email verification:**
```typescript
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

const token = await generateVerificationToken(userId);
await sendVerificationEmail(email, token);
```

**License validation:**
```typescript
// POST /api/memberships/[key]/validate_license
// Checks: active status, expiration, hardware binding, activation limits
```

**Company access with role:**
```typescript
const companyUser = await requireCompanyAccess(userId, companyId, 'admin');
// Hierarchy: owner > admin > member
```

---

**For complete patterns see:** `CLAUDE.md` | `Whop-saas-implementations-plan.md` | `FEATURES.md`
