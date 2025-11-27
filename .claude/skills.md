# Whop SaaS Marketplace - Project Skills & Agents

## 🚨 CRITICAL WORKFLOW RULES (CACHE THIS - MUST FOLLOW ALWAYS)

### Development Server & Build Rules
**NEVER run without user permission:**
- ❌ `pnpm dev`
- ❌ `pnpm build`
- ❌ `pnpm start`

**ALWAYS ask user to run these commands.**

### TypeScript Type Safety Rules
**CRITICAL:**
- ❌ NEVER use `any` or `unknown` types
- ✅ ALWAYS define proper TypeScript interfaces/types
- ✅ Use strict type checking for all code
- ✅ Define explicit types for all function parameters and returns

### Tailwind v4 Configuration
**IMPORTANT:**
- ❌ DO NOT use `tailwind.config.ts` (not needed in v4)
- ✅ Configure Tailwind directly in `app/globals.css` using `@import` and `@theme`
- ✅ Tailwind v4 uses CSS-based configuration

### Database Configuration
**CONFIRMED:**
- ✅ Database variables already configured in `.env` and `.env.local`
- ✅ Always run migrations after schema changes
- ✅ User has confirmed database connection is ready

### Phase Completion Quality Gate (MANDATORY)
After completing ANY phase:

1. **Run Quality Checks**
   ```bash
   pnpm lint              # ESLint check
   npx tsc --noEmit       # TypeScript check
   ```

2. **Fix ALL errors** before proceeding

3. **Only after all checks pass** → Git commit & push

**Process:**
```
Phase Done → Lint → Type Check → All Pass? → Git Push
               ↓         ↓           ↓
           Fix Errors  Fix Errors  Report
```

---

## Project Context (CACHE THIS)

**Project Type:** Production-grade SaaS marketplace (Whop.com clone)
**Valuation Target:** $400M+ marketplace handling real money transactions
**Tech Stack:** Next.js 15, Stripe Connect, PostgreSQL (Neon), Redis + Bull, Prisma

## Critical Architecture Principles (CACHE THIS)

1. **Multi-Tenant SaaS** - tenant_id on ALL tables, automatic isolation via Prisma middleware
2. **Stripe Connect** - Sub-merchant payments with automated platform fee splits
3. **Money Safety** - ALL amounts in minor units (cents), idempotent operations
4. **Webhook System** - Async delivery via Bull queue, 3 retries with exponential backoff
5. **License Management** - Hardware-bound keys with activation limits
6. **Security First** - HMAC-SHA256 signatures, CSP headers, official Whop SDK only

## Database Schema Reference (CACHE THIS)

**Core Models:**
- `Company` - Multi-tenant hierarchy (platform → sub-merchants)
- `User` - Email, password_hash, OAuth fields
- `Product` - Company scoped, license templates, pricing
- `Membership` - Active subscriptions, license keys, HWID binding
- `Payment` - Stripe payment intents, platform fees, idempotency
- `Webhook` - Event subscriptions with HMAC secrets
- `WebhookDelivery` - Retry tracking, response logging
- `LicenseKey` - Hardware binding, activation limits
- `App` - Third-party app marketplace

**Schema Location:** `prisma/schema.prisma` (lines 404-811 in implementation plan)

## Critical Constraints (CACHE THIS)

**MUST Requirements:**
1. Money in minor units (cents) - avoid floating-point errors
2. Idempotent payment processing - unique `idempotency_key`
3. Webhook signature verification - HMAC-SHA256
4. Tenant isolation - automatic `company_id` filtering
5. Rate limiting - 100 req/min per IP
6. Immutable transaction logs
7. CSP headers - `frame-ancestors 'self' https://*.whop.com`
8. Official Whop SDK - NO custom JWT parsing
9. Async webhook delivery - prevent timeouts

## Implementation Phases (CACHE THIS)

1. **Foundation** - Next.js 15, Prisma schema, environment setup
2. **Core Infrastructure** - Prisma singleton, Whop SDK, webhook queue
3. **Payment Infrastructure** - Stripe checkout, webhooks, sub-merchant onboarding
4. **License System** - Validation endpoint, hardware binding
5. **App Ecosystem** - Experience pages, dashboards, security middleware
6. **Background Workers** - Webhook delivery worker
7. **API Endpoints** - Products, companies, memberships, webhooks
8. **Testing** - Unit, integration, load tests
9. **Deployment** - Neon, Upstash, Vercel, Railway

## Key Files Reference (CACHE THIS)

**Core Infrastructure:**
- `lib/prisma.ts` - Singleton + tenant isolation middleware
- `lib/whop-sdk/index.ts` - Whop API + Stripe integration
- `lib/webhook-queue.ts` - Bull queue + async delivery

**Payment System:**
- `app/api/checkout/create-session/route.ts` - Stripe checkout
- `app/api/webhooks/stripe/route.ts` - Payment event handler
- `app/api/companies/onboard/route.ts` - Sub-merchant KYC

**License System:**
- `app/api/memberships/[key]/validate_license/route.ts` - HWID validation

**App Ecosystem:**
- `app/experiences/[experienceId]/page.tsx` - B2C iframe apps
- `app/dashboard/[companyId]/page.tsx` - B2B dashboards
- `middleware.ts` - Security headers (CSP, X-Frame-Options)

**Workers:**
- `src/workers/index.ts` - Webhook delivery processor

## Custom Agents

### Agent: payment-expert
**Purpose:** Handles all payment-related implementations
**Context:** Stripe Connect, platform fees, idempotency, webhook handling
**Use for:**
- Creating checkout sessions
- Implementing webhook handlers
- Sub-merchant onboarding
- Payment reconciliation

### Agent: security-auditor
**Purpose:** Reviews code for security vulnerabilities
**Context:** PCI compliance, tenant isolation, webhook signatures
**Use for:**
- Reviewing payment flows
- Validating tenant isolation
- Checking webhook signature verification
- CSP header configuration

### Agent: database-architect
**Purpose:** Manages database schema and Prisma configuration
**Context:** Multi-tenant design, tenant isolation middleware
**Use for:**
- Schema modifications
- Migration creation
- Prisma middleware implementation
- Query optimization for tenant filtering

### Agent: webhook-specialist
**Purpose:** Implements webhook delivery and retry logic
**Context:** Bull queue, exponential backoff, signature generation
**Use for:**
- Webhook queue setup
- Retry logic implementation
- Delivery tracking
- Event broadcasting

## Code Patterns (CACHE THIS)

### Tenant Isolation Pattern
```typescript
// CRITICAL: Auto-inject company_id via Prisma middleware
prisma.$use(async (params, next) => {
  const TENANT_MODELS = ['Product', 'Membership', 'Payment', 'Webhook', 'App'];
  if (params.model && TENANT_MODELS.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};
      params.args.where.company_id = tenantStorage.getStore()?.companyId;
    }
  }
  return next(params);
});
```

### Idempotency Pattern
```typescript
const idempotencyKey = `checkout_${userId}_${productId}_${Date.now()}`;
await stripe.checkout.sessions.create(sessionData, { idempotencyKey });
```

### Webhook Signature Pattern
```typescript
const signature = createHmac('sha256', secret)
  .update(payloadString)
  .digest('hex');
```

### Money Handling Pattern
```typescript
// ALWAYS use minor units (cents)
const priceMinorUnits = Math.round(priceInDollars * 100);
const platformFee = Math.round(priceMinorUnits * (platformFeePercent / 100));
```

## Environment Variables (CACHE THIS)

**Database:**
- `DATABASE_URL` - Neon PostgreSQL connection
- `DIRECT_URL` - Direct connection for migrations

**Stripe:**
- `STRIPE_SECRET_KEY` - API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- `STRIPE_CONNECT_CLIENT_ID` - Connect platform ID

**Whop:**
- `WHOP_API_KEY` - API authentication
- `WHOP_APP_ID` - App identifier
- `WHOP_AGENT_USER_ID` - Agent user
- `NEXT_PUBLIC_WHOP_APP_ID` - Public app ID

**Redis:**
- `REDIS_URL` - Connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` - Individual config

**Platform:**
- `PLATFORM_COMPANY_ID` - Platform company identifier
- `PLATFORM_FEE_PERCENT` - Default platform fee
- `BASE_URL` - Application base URL
- `JWT_SECRET` - Token signing key
- `NODE_ENV` - Environment (development/production)

## Testing Strategy (CACHE THIS)

**Unit Tests:**
- Webhook signature verification
- Tenant isolation middleware
- License validation logic
- Payment amount calculations

**Integration Tests:**
- Complete checkout flow (Stripe test mode)
- Webhook delivery and retry
- Sub-merchant onboarding
- License activation with HWID

**Load Tests:**
- 1000 concurrent checkouts
- 10,000 webhook deliveries/min
- Database query performance

## Deployment Targets (CACHE THIS)

**Neon PostgreSQL:**
- Database hosting
- Automatic backups
- Connection pooling

**Upstash Redis:**
- Bull queue backend
- Session storage
- Rate limiting

**Vercel:**
- Next.js application
- Edge functions
- Automatic deployments

**Railway:**
- Background webhook worker
- Separate service deployment
- Auto-scaling

## Success Metrics (CACHE THIS)

- Payment success rate: >98%
- Webhook delivery rate: >99%
- API response time (p95): <500ms
- Zero tenant data leakage
- Zero downtime deployments
- PCI DSS compliance

## Token Optimization Notes

This skills.md file is designed to be cached by Claude's system. Reference this file in conversations to avoid repeating:
- Architecture principles
- Database schema structure
- Critical constraints
- Code patterns
- Environment variables
- Testing strategy

Always reference "See skills.md" instead of repeating cached content.
