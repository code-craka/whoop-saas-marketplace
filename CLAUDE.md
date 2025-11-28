# CLAUDE.md - Whop SaaS Marketplace

## 🚨 CRITICAL RULES

**Package Manager:** ✅ ALWAYS use `pnpm` (NOT npm/yarn)
**Commands:** ❌ NEVER run `pnpm dev|build|start` without permission
**Types:** ❌ NO `any`/`unknown` ✅ USE explicit types, `Prisma.JsonObject`
**Tailwind v4:** Configure in `app/globals.css` (no config file needed)

**Quality Checklist:**
```bash
pnpm lint && npx tsc --noEmit  # Must pass before commit
```

---

## Stack
**Next.js 16 + React 19 + Prisma 7 + PostgreSQL + Stripe Connect + Whop SDK**

### Next.js 16 Key Changes
- ✅ `params`/`searchParams` are `Promise<T>` (must await)
- ✅ `cookies()`, `headers()`, `draftMode()` are async
- ✅ Turbopack is default bundler
- ✅ Bull/Redis removed (incompatible) → sync webhooks with backoff

### Prisma 7 Setup (CRITICAL)
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "./generated/client"
}

// lib/prisma.ts - PostgreSQL Adapter
import { PrismaClient } from '../prisma/generated/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export { prisma, Prisma };
```

**Import Pattern:** All files must import from `lib/prisma.ts` singleton:
```typescript
import { prisma, Prisma } from '@/lib/prisma';
```

---

## 5 Security Patterns (HIGHEST PRIORITY)

### 1. Multi-Tenant Isolation
```typescript
// Auto-inject company_id on ALL tenant models
runInTenantContext({ companyId }, async () => {
  await prisma.product.findMany(); // Auto-filtered
});
```

### 2. Money = Cents
```typescript
const cents = 4999; // $49.99 ✅
const fee = Math.round(cents * 0.027);
```

### 3. Idempotency Keys
```typescript
const key = `checkout_${userId}_${productId}_${nanoid()}`;
await stripe.checkout.sessions.create(data, { idempotencyKey: key });
```

### 4. Webhook HMAC
```typescript
const sig = createHmac('sha256', secret).update(payload).digest('hex');
```

### 5. Tenant Models
**ALWAYS require `company_id`:** Product, Membership, Payment, Webhook, App, CompanyUser, WebhookDelivery

---

## Critical Files

| Purpose | Path |
|---------|------|
| **Prisma Singleton** | `lib/prisma.ts` |
| **Auth** | `lib/auth.ts`, `app/actions/auth.ts` |
| **Email** | `lib/email.ts` |
| **Webhooks** | `lib/webhook-queue.ts` |
| **Whop SDK** | `lib/whop-sdk/index.ts` |
| **Payments** | `lib/stripe.ts` |
| **Schema** | `prisma/schema.prisma` |
| **Design System** | `app/globals.css`, `.claude/skills/ui-design.md` |

---

## Common Patterns

### Auth
```typescript
// Protect routes
const user = await requireAuth(); // → redirect if not auth

// Session
const session = await getCurrentSession(); // → null if not auth

// Register/Login
const session = await registerUser({ email, password, name });
const session = await loginUser({ email, password });
```

### Whop SDK
```typescript
import { verifyWhopToken } from '@/lib/whop-sdk';
const tokenData = await verifyWhopToken(token);

import { authenticateWhopIframe } from '@/lib/auth';
const session = await authenticateWhopIframe(token);
```

### Email Verification
```typescript
import { generateVerificationToken, sendVerificationEmail, verifyEmailToken } from '@/lib/email';

const token = await generateVerificationToken(userId);
await sendVerificationEmail(email, token);
const isValid = await verifyEmailToken(token);
```

### Webhooks
```typescript
import { triggerWebhook, WebhookEvents } from '@/lib/webhook-queue';

await triggerWebhook(companyId, WebhookEvents.PAYMENT_SUCCEEDED, {
  payment_id: paymentId,
  amount: amountInCents,
});
```

### API Routes
```typescript
import { z } from 'zod';
import { runInTenantContext } from '@/lib/prisma';

const schema = z.object({ name: z.string() });

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  return await runInTenantContext({ companyId }, async () => {
    // Auto-filtered queries
    return NextResponse.json({ success: true });
  });
}
```

---

## CRUD API Endpoints

### Products API
```typescript
// List: GET /api/products?company_id={id}&active=true&limit=50&offset=0
// Create: POST /api/products { company_id, title, price_amount|price_minor_units, plan_type }
// Get: GET /api/products/{id}
// Update: PUT /api/products/{id} { title?, price_amount?, active? }
// Delete: DELETE /api/products/{id} // Soft delete (active=false)
```

### Companies API
```typescript
// List: GET /api/companies?role=owner&type=sub_merchant&limit=50
// Create: POST /api/companies { title, email, type } // Auto-generates slug
// Get: GET /api/companies/{id}
// Update: PUT /api/companies/{id} { title?, platform_fee_percent?, status? }
```

### Memberships API
```typescript
// List: GET /api/memberships?company_id={id}&status=active&product_id={id}
// Get: GET /api/memberships/{id}
// Update: PUT /api/memberships/{id} { status?, cancel_at?, metadata? }
// Note: Created via checkout flow, not POST endpoint
```

### Webhooks API
```typescript
// List: GET /api/webhooks?company_id={id}&active=true
// Create: POST /api/webhooks { company_id, url, events[] } // Returns secret
// Get: GET /api/webhooks/{id}
// Update: PUT /api/webhooks/{id} { url?, events?, active? }
// Delete: DELETE /api/webhooks/{id}

// Events: payment.succeeded, payment.failed, membership.created/updated/canceled,
//         product.created/updated/deleted
```

**Security:** All endpoints require auth, enforce tenant isolation, validate permissions (owner/admin/member)

---

## TypeScript SDK

**Quick Usage:**
```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';

const client = new WhopSaaSClient();
const { products } = await client.products.list({ company_id: 'biz_123' });
```

**Full SDK:** `lib/sdk/client.ts` | **Docs:** `lib/sdk/README.md` | **Generate:** `./scripts/generate-sdk.sh`

---

## Documentation Access

- **Swagger UI:** http://localhost:3000/api/docs (interactive)
- **OpenAPI Spec:** http://localhost:3000/api/openapi (download)
- **API Guide:** `/API_DOCUMENTATION.md` (full reference)
- **Team Guide:** `/TEAM_GUIDE.md` (sharing templates)

---

## Environment Variables

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."

# Stripe Connect
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Whop SDK
WHOP_API_KEY="apik_..."
WHOP_APP_ID="app_..."
WHOP_WEBHOOK_SECRET="whsec_..."

# Auth
JWT_SECRET="min-32-chars"

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_PROJECT_ID="..."

# Email (Resend)
RESEND_API_KEY="re_..."

# App
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

---

## Database Commands

```bash
pnpm db:push      # Dev schema sync
pnpm db:migrate   # Create migration
pnpm db:studio    # GUI
pnpm prisma generate  # Regenerate client
```

---

## Security Checklist

**NEVER:**
- ❌ Floating-point money
- ❌ Queries without `company_id` on tenant models
- ❌ Skip webhook signature verification
- ❌ Store passwords in plaintext
- ❌ Expose OAuth secrets client-side
- ❌ Use `any` or `unknown` types

**ALWAYS:**
- ✅ Import from `lib/prisma.ts` singleton
- ✅ Cents for money
- ✅ Idempotency keys
- ✅ HMAC webhook signatures
- ✅ Tenant isolation via `runInTenantContext`
- ✅ Zod validation
- ✅ Hash passwords (bcrypt, 10+ rounds)
- ✅ HTTP-only secure cookies
- ✅ Server-side form validation

---

## Implementation Status

### ✅ Phase 5: App Ecosystem (COMPLETED)
Whop SDK, `proxy.ts` (Next.js 16 middleware), design system, B2C/B2B dashboards, license validation

### ✅ Phase 6: Auth & UI (COMPLETED)
Login/register, OAuth (Google/Apple), email verification, profile management, cyberpunk UI

### ✅ Phase 7: CRUD APIs (COMPLETED)
Products, Companies, Memberships, Webhooks - Full CRUD with tenant isolation, RBAC, Zod validation

### ✅ Phase 8: Prisma 7 Migration (COMPLETED)
PostgreSQL adapter, driver pool, generated client at `prisma/generated/client`

### ✅ Phase 9: API Documentation & SDKs (COMPLETED)
OpenAPI 3.0 spec, Swagger UI, TypeScript SDK, team sharing guides, SDK generation scripts

### 🎯 Next: Testing & Production Deploy
Integration tests, E2E tests, Vercel deployment, monitoring, CI/CD

---

## Design System

**Theme:** Neon Cyberpunk
**Colors:** Primary `#00ff9d`, Accent `#ff006e`, Background `#0a0a0f`
**Fonts:** Sora (headings), JetBrains Mono (code)
**Animations:** slideInUp, glow, float, pulse-glow

See `.claude/skills/ui-design.md` for full guide.

---

**More:** `Whop-saas-implementations-plan.md` | `.claude/skills.md` | `FEATURES.md`
