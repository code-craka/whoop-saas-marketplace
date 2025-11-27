# CLAUDE.md - Whop SaaS Marketplace Guide

## 🚨 CRITICAL WORKFLOW RULES

### Development Commands (NEVER RUN WITHOUT PERMISSION)
❌ `pnpm dev` | `pnpm build` | `pnpm start` - **ASK USER FIRST**

### TypeScript Rules (MANDATORY)
- ❌ **NO** `any` or `unknown` types
- ✅ **USE** `Prisma.JsonObject`, `Prisma.JsonValue` for JSON
- ✅ Explicit types for all parameters/returns

### Tailwind v4
- ❌ NO `tailwind.config.ts` (not needed)
- ✅ Configure in `app/globals.css` with `@import` / `@theme`

### Phase Completion Checklist
```bash
# 1. Run quality checks
pnpm lint && npx tsc --noEmit

# 2. Fix ALL errors (lint + types)

# 3. Commit only after ALL pass
git add . && git commit -m "feat: [description]" && git push
```

---

## Project: Whop SaaS Marketplace ($400M Clone)
**Stack:** Next.js 15 + Prisma + Stripe Connect + Bull/Redis + Whop SDK

---

## 5 CRITICAL Security Patterns

### 1. Multi-Tenant Isolation (HIGHEST PRIORITY)
```typescript
// lib/prisma.ts - Auto-inject company_id
const TENANT_MODELS = ['Product', 'Membership', 'Payment', 'Webhook', 'App'];
runInTenantContext({ companyId }, async () => {
  await prisma.product.findMany(); // Auto-filtered by company_id
});
```

### 2. Money = Cents (ALWAYS)
```typescript
const priceInCents = 4999; // $49.99 ✅
const fee = Math.round(priceInCents * 0.027); // ✅
// NEVER: const price = 49.99; ❌
```

### 3. Idempotency Keys
```typescript
const key = `checkout_${userId}_${productId}_${nanoid()}`;
await stripe.checkout.sessions.create(data, { idempotencyKey: key });
```

### 4. Webhook HMAC-SHA256
```typescript
import { createHmac } from 'crypto';
const sig = createHmac('sha256', secret).update(payload).digest('hex');
```

### 5. Async Webhooks (Bull Queue)
```typescript
await webhookQueue.add(data, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 } // 5s→25s→125s
});
```

---

## Key Files

| Purpose | Path |
|---------|------|
| **Auth & Sessions** | `lib/auth.ts` |
| **Whop SDK** | `lib/whop-sdk/index.ts` |
| **Security Middleware** | `middleware.ts` |
| **Tailwind Design System** | `app/globals.css` |
| Tenant isolation | `lib/prisma.ts` |
| Payments | `lib/stripe.ts` |
| Webhooks | `lib/webhook-queue.ts` |
| **B2C Experience Page** | `app/experiences/[experienceId]/page.tsx` |
| **B2B Dashboard** | `app/dashboard/[companyId]/page.tsx` |
| **License Validation** | `app/api/memberships/[key]/validate_license/route.ts` |
| Checkout API | `app/api/checkout/create/route.ts` |
| Stripe webhooks | `app/api/webhooks/stripe/route.ts` |
| Schema | `prisma/schema.prisma` |

---

## Commands

```bash
# Database
pnpm db:push          # Dev schema sync
pnpm db:migrate       # Create migration
pnpm db:studio        # GUI

# Quality
pnpm lint             # ESLint
npx tsc --noEmit      # Type check

# Worker
pnpm worker           # Start Bull queue worker
```

---

## Database Schema (13 Models)

**Tenant-scoped (require `company_id`):**
Product, Membership, Payment, Webhook, App, CompanyUser, WebhookDelivery

**Enums:** CompanyType, CompanyStatus, PaymentStatus, MembershipStatus, WebhookStatus

---

## Development Patterns

### Whop SDK Usage
```typescript
import { WhopServerSdk } from '@whop/api';

// Initialize SDK (already done in lib/whop-sdk/index.ts)
const whopSdk = WhopServerSdk({
  appApiKey: process.env.WHOP_API_KEY!,
  appId: process.env.WHOP_APP_ID || '',
});

// Verify iframe token
import { verifyWhopToken } from '@/lib/whop-sdk';
const tokenData = await verifyWhopToken(token); // Returns { userId, appId }

// Get user/company data
const user = await whopSdk.users.getUser({ userId });
const company = await whopSdk.companies.getCompany({ companyId });

// Check access
const result = await whopSdk.access.checkIfUserHasAccessToExperience({
  experienceId,
  userId,
});
```

### Authentication Patterns
```typescript
// Password-based auth (lib/auth.ts)
import { registerUser, loginUser, requireAuth } from '@/lib/auth';

// Register
const session = await registerUser({ email, password, name });

// Login
const session = await loginUser({ email, password });

// Protect routes
const user = await requireAuth(); // Redirects if not logged in

// Whop iframe auth (for B2C experiences)
import { authenticateWhopIframe } from '@/lib/auth';
const whopSession = await authenticateWhopIframe(token);
```

### New API Endpoint
```typescript
import { z } from 'zod';
import { runInTenantContext } from '@/lib/prisma';

const schema = z.object({ name: z.string() });

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  return await runInTenantContext({ companyId }, async () => {
    // Auto-filtered queries here
    return NextResponse.json({ success: true });
  });
}
```

### Trigger Webhook
```typescript
import { triggerWebhook, WebhookEvents } from '@/lib/webhook-queue';

await triggerWebhook(companyId, WebhookEvents.PAYMENT_SUCCEEDED, {
  payment_id: paymentId,
  amount: amountInCents,
});
```

### License Key Validation
```typescript
// Client application validates license
const response = await fetch(`/api/memberships/${key}/validate_license`, {
  method: 'POST',
  body: JSON.stringify({
    hardware_id: getHardwareId(),
    device_name: os.hostname(),
  }),
});

const { valid, product, user, activations } = await response.json();
```

---

## Environment Variables (Required)

```bash
# Database
DATABASE_URL="postgresql://..."

# Redis (for Bull queue workers)
REDIS_URL="redis://..."

# Stripe Connect
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Whop SDK Integration
WHOP_API_KEY="apik_..."           # Required for SDK
WHOP_APP_ID="app_..."             # Required for token verification
WHOP_WEBHOOK_SECRET="whsec_..."   # Required for webhook validation

# JWT Sessions
JWT_SECRET="your-secure-secret"   # For password-based auth

# App Config
BASE_URL="http://localhost:3000"
```

See `.env.example` for complete list.

---

## Security Checklist

**NEVER:**
- ❌ Floating-point money
- ❌ Manual JWT parsing (use Whop SDK token verifier)
- ❌ Queries without `company_id`
- ❌ Sync webhooks
- ❌ Skip signature verification
- ❌ Use `request.ip` (Next.js 15 doesn't support it)

**ALWAYS:**
- ✅ Cents for money
- ✅ Idempotency keys
- ✅ HMAC signatures via Whop SDK webhook validator
- ✅ Tenant isolation
- ✅ Zod validation
- ✅ Use `request.headers.get('x-forwarded-for')` for IP detection
- ✅ Verify Whop tokens with official SDK, never manually

---

## Implementation Status

### ✅ Phase 5: App Ecosystem & Security (COMPLETED)
- [x] Whop SDK integration (`lib/whop-sdk/`)
- [x] Security middleware with CSP headers (`middleware.ts`)
- [x] Tailwind v4 design system (`app/globals.css`)
- [x] B2C experience page with iframe auth
- [x] B2B dashboard with stats & team management
- [x] Products and settings pages
- [x] License key validation endpoint
- [x] Error boundary and 404 page
- [x] Quality checks: **0 TypeScript errors, 0 ESLint errors**

### 🎯 Next: Deploy & Production Setup
- [ ] Configure environment variables
- [ ] Set up Stripe Connect onboarding
- [ ] Deploy to Vercel/production
- [ ] Configure Redis for Bull queues
- [ ] Set up monitoring & logging

---

**Full docs:** `Whop-saas-implementations-plan.md` | `.claude/skills.md`
