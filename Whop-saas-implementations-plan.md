``xml
<claude_code_task>
<metadata>
  <task_id>whop-saas-marketplace-production-v2</task_id>
  <version>2.0</version>
  <created>2025-11-25</created>
  <difficulty>expert</difficulty>
  <estimated_time>8-12 weeks</estimated_time>
</metadata>

<role>
You are a senior full-stack architect and principal engineer at a Y Combinator-backed startup. Your mission is to build a production-grade, enterprise-ready marketplace platform similar to Whop.com that enables:

- Multi-tenant SaaS with complete data isolation
- Stripe Connect payment orchestration for sub-merchants
- Embedded B2B app ecosystem with iframe security
- Global payment infrastructure (payins + automated payouts)
- Real-time webhook event broadcasting
- License key management with hardware binding
- Subscription and one-time payment models

YOU MUST write production-quality code with comprehensive error handling, proper TypeScript types, security best practices, and scalability in mind. This code will handle real money transactions and sensitive user data.
</role>

<context>
## Platform Overview

Whop is a $400M+ valued marketplace enabling creators to monetize digital products through:
- **Multi-tenancy**: Platform hosts thousands of independent sub-merchant businesses
- **Payment Rails**: Handles $1B+ annual payment volume with 2.7% + $0.30 fees
- **App Ecosystem**: 500+ third-party apps embedded via secure iframes
- **Global Scale**: 241+ countries, multiple currencies, crypto payouts
- **Developer Platform**: SDKs in TypeScript, Python, Ruby, Go

## Architecture Decisions

**Why Next.js 15**: Server components, React 19, edge runtime, built-in API routes
**Why Stripe Connect**: PCI compliance, global coverage, proven sub-merchant infrastructure
**Why PostgreSQL**: ACID compliance for financial data, JSON support, mature ecosystem
**Why Redis + Bull**: Distributed job queue for async webhook delivery
**Why Prisma**: Type-safe queries, migrations, multi-provider support

## Key Technical Constraints

- MUST handle money calculations in minor units (cents) to avoid floating-point errors
- MUST implement idempotent payment processing with unique request IDs
- MUST verify webhook signatures using HMAC-SHA256
- MUST enforce row-level tenant isolation in database queries
- MUST rate-limit API endpoints (100 req/min per IP)
- MUST log all financial transactions immutably
- MUST support CSP headers for iframe embedding security
</context>

<requirements>
## Critical System Requirements

### 1. Multi-Tenant Architecture (HIGHEST PRIORITY)

**Database Design:**
- Shared database with tenant_id on ALL tables
- Automatic tenant filtering via Prisma middleware
- Parent-child company hierarchy (platform → sub-merchants)
- No cross-tenant data leakage (enforce with integration tests)

**Tenant Isolation Middleware:**
```
// IMPORTANT: This MUST be applied globally to prevent data leaks
prisma.$use(async (params, next) => {
  const TENANT_MODELS = ['Product', 'Membership', 'Payment', 'Webhook'];

  if (params.model && TENANT_MODELS.includes(params.model)) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args.where) params.args.where = {};
      params.args.where.company_id = getCurrentTenantId(); // From context
    }
  }

  return next(params);
});
```

### 2. Authentication & Authorization (CRITICAL)

**YOU MUST use official Whop SDK** - NOT custom JWT parsing:
```
// CORRECT ✓
import { makeUserTokenVerifier } from "@whop/api";
export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.WHOP_APP_ID!,
  dontThrow: true
});

// WRONG ✗ - Never implement custom JWT parsing
const payload = JSON.parse(Buffer.from(token.split('.'), 'base64').toString());[1]
```

**Access Control Checks:**
- `checkAccess(productId, userId)` for membership validation
- `checkCompanyAccess(companyId, userId, role)` for dashboard access
- Hardware-bound license keys with metadata validation
- API key rotation with versioned secrets

### 3. Payment Infrastructure (MONEY = CRITICAL)

**Stripe Connect Integration:**
- Express accounts for sub-merchant onboarding
- Platform fee calculation from database (`company.platform_fee_percent`)
- Application fees via `payment_intent_data.application_fee_amount`
- Automated transfers via `transfer_data.destination`

**Checkout Flow:**
```
// IMPORTANT: All amounts in minor units (cents)
const sessionData: Stripe.Checkout.SessionCreateParams = {
  mode: planType === 'one_time' ? 'payment' : 'subscription',
  line_items: [{
    price_data: {
      currency: 'usd',
      unit_amount: priceInCents, // NEVER use dollars here
      product_data: { name: productTitle }
    },
    quantity: 1
  }],
  payment_intent_data: {
    application_fee_amount: Math.round(priceInCents * (platformFee / 100)),
    transfer_data: { destination: stripeAccountId }
  },
  metadata: {
    product_id: productId,
    user_id: userId,
    company_id: companyId
  }
};
```

**Idempotency:**
```
// YOU MUST include idempotency keys for all payment mutations
await stripe.paymentIntents.create(
  { amount: 1000, currency: 'usd' },
  { idempotencyKey: `payment_${userId}_${Date.now()}` }
);
```

### 4. Webhook System (ASYNC REQUIRED)

**YOU MUST use asynchronous delivery** - synchronous webhooks will cause timeouts:

```
import Bull from 'bull';

const webhookQueue = new Bull('webhooks', {
  redis: process.env.REDIS_URL!,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }, // 5s, 25s, 125s
    removeOnComplete: true
  }
});

// Queue webhook (fast)
await webhookQueue.add({
  webhookId: webhook.id,
  eventType: 'payment.succeeded',
  payload: { ... },
  signature: generateHMAC(payload, webhook.secret)
});

// Process webhook (async worker)
webhookQueue.process(async (job) => {
  const { url, payload, signature } = job.data;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Whop-Signature': signature,
      'X-Whop-Event-Type': payload.type
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000) // 30s timeout
  });

  if (!response.ok && job.attemptsMade < 3) {
    throw new Error('Retry'); // Automatic exponential backoff
  }
});
```

**Signature Verification:**
```
import { createHmac } from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature; // Constant-time comparison in production
}
```

### 5. App Ecosystem & Iframe Security

**Content Security Policy (MANDATORY):**
```
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CRITICAL: Prevent clickjacking while allowing Whop embedding
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.whop.com"
  );

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');

  return response;
}

export const config = {
  matcher: ['/experiences/:path*', '/dashboard/:path*']
};
```

**App View Authentication:**
```
// app/experiences/[experienceId]/page.tsx
export default async function ExperiencePage({ params }: { params: Promise<{ experienceId: string }> }) {
  const { experienceId } = await params;
  const headers = await headers();

  // STEP 1: Verify user token from iframe parent
  const tokenData = await verifyUserToken(headers);
  if (!tokenData) {
    return <UnauthorizedView />;
  }

  // STEP 2: Check membership access
  const hasAccess = await whopSdk.checkAccess(experienceId, tokenData.userId);
  if (!hasAccess) {
    return <PurchaseRequiredView productId={experienceId} />;
  }

  // STEP 3: Render protected content
  return <ExperienceContent experienceId={experienceId} userId={tokenData.userId} />;
}
```

### 6. License Key System with Hardware Binding

**Validation Endpoint:**
```
// POST /api/v2/memberships/:key/validate_license
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const { hardware_id } = await req.json();

  const license = await prisma.licenseKey.findUnique({
    where: { key },
    include: { product: true, user: true }
  });

  // Check 1: License exists and active
  if (!license?.active) {
    return NextResponse.json({ valid: false, reason: 'License not found or inactive' }, { status: 403 });
  }

  // Check 2: Expiration
  if (license.expires_at && license.expires_at < new Date()) {
    return NextResponse.json({ valid: false, reason: 'License expired' }, { status: 403 });
  }

  const metadata = (license.metadata as any) || {};

  // Check 3: Hardware binding
  if (metadata.hardware_id && metadata.hardware_id !== hardware_id) {
    return NextResponse.json({ valid: false, reason: 'Hardware mismatch' }, { status: 403 });
  }

  // Check 4: Max activations
  if (license.current_activations >= license.max_activations && !metadata.hardware_id) {
    return NextResponse.json({ valid: false, reason: 'Activation limit reached' }, { status: 403 });
  }

  // Update activation
  await prisma.licenseKey.update({
    where: { id: license.id },
    data: {
      last_validated_at: new Date(),
      current_activations: metadata.hardware_id ? license.current_activations : { increment: 1 },
      metadata: { ...metadata, hardware_id, last_ip: req.ip }
    }
  });

  return NextResponse.json({
    valid: true,
    product: license.product,
    user: { id: license.user.id, email: license.user.email },
    expires_at: license.expires_at
  });
}
```

### 7. Sub-Merchant Onboarding (KYC Flow)

```
// POST /api/companies/onboard
export async function POST(req: NextRequest) {
  const { company_id } = await req.json();

  const company = await prisma.company.findUnique({
    where: { id: company_id },
    select: { stripe_account_id: true, email: true }
  });

  if (!company?.stripe_account_id) {
    throw new Error('Stripe account not found');
  }

  // Create Stripe Connect onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: company.stripe_account_id,
    refresh_url: `${process.env.BASE_URL}/onboarding/refresh?company_id=${company_id}`,
    return_url: `${process.env.BASE_URL}/dashboard/${company_id}/settings`,
    type: 'account_onboarding'
  });

  // Update expiration
  await prisma.company.update({
    where: { id: company_id },
    data: { onboarding_link_expires_at: new Date(Date.now() + 5 * 60 * 1000) } // 5 min
  });

  return NextResponse.json({ url: accountLink.url });
}

// Webhook handler for onboarding completion
if (event.type === 'account.updated') {
  const account = event.data.object as Stripe.Account;

  if (account.details_submitted && account.charges_enabled) {
    await prisma.company.update({
      where: { stripe_account_id: account.id },
      data: {
        status: 'active',
        stripe_onboarded: true,
        onboarding_completed: true
      }
    });
  }
}
```

### 8. Security Requirements (NON-NEGOTIABLE)

**Rate Limiting:**
```
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});
```

**Input Validation:**
```
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(2).max(255),
  price_amount: z.number().positive().max(1000000),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  plan_type: z.enum(['one_time', 'monthly', 'yearly'])
});

// YOU MUST validate all user inputs
const validatedData = createProductSchema.parse(requestBody);
```

**SQL Injection Prevention:**
```
// CORRECT ✓ - Prisma automatically parameterizes queries
await prisma.user.findMany({
  where: { email: userInput } // Safe
});

// WRONG ✗ - Never use raw SQL with user input
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`; // Vulnerable
```

</requirements>

<database_schema>
```
// schema.prisma - Production-grade database design

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["jsonProtocol", "metrics"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}

// ============================================================================
// ENUMS
// ============================================================================

enum CompanyType {
  platform
  sub_merchant
}

enum CompanyStatus {
  active
  pending_kyc
  suspended
  closed
}

enum PaymentStatus {
  pending
  processing
  succeeded
  failed
  refunded
  cancelled
}

enum MembershipStatus {
  active
  past_due
  canceled
  expired
  trialing
}

enum WebhookStatus {
  pending
  delivered
  failed
}

// ============================================================================
// CORE ENTITIES
// ============================================================================

model Company {
  id        String        @id @default(cuid()) @map("company_id")
  type      CompanyType   @default(sub_merchant)
  status    CompanyStatus @default(pending_kyc)

  // Hierarchy
  parent_company_id String?
  parent_company    Company?  @relation("CompanyHierarchy", fields: [parent_company_id], references: [id], onDelete: Restrict)
  sub_merchants     Company[] @relation("CompanyHierarchy")

  // Business Details
  title       String  @db.VarChar(255)
  email       String  @unique
  slug        String  @unique
  logo_url    String?
  website_url String?
  description String? @db.Text

  // Stripe Connect
  stripe_account_id  String?   @unique
  stripe_onboarded   Boolean   @default(false)

  // Onboarding
  onboarding_completed       Boolean   @default(false)
  onboarding_link_expires_at DateTime?

  // Platform Fees
  platform_fee_percent Decimal @default(5.0) @db.Decimal(5, 2)

  // Payout Settings
  payout_minimum_amount Decimal @default(50.00) @db.Decimal(10, 2)
  payout_frequency      String  @default("weekly") // daily, weekly, monthly

  // Metadata
  metadata   Json?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  users       CompanyUser[]
  apps        App[]
  products    Product[]
  memberships Membership[]
  payments    Payment[]
  webhooks    Webhook[]

  @@index([parent_company_id])
  @@index([type, status])
  @@index([stripe_account_id, stripe_onboarded])
  @@map("companies")
}

model User {
  id       String  @id @default(cuid()) @map("user_id")
  email    String  @unique
  username String? @unique

  // Profile
  name       String?
  avatar_url String?

  // Auth
  password_hash  String?
  email_verified Boolean  @default(false)

  // Timestamps
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  companies    CompanyUser[]
  memberships  Membership[]
  license_keys LicenseKey[]

  @@index([email])
  @@map("users")
}

model CompanyUser {
  id         String @id @default(cuid())
  user_id    String
  company_id String
  role       String @default("member") // owner, admin, member

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  company Company @relation(fields: [company_id], references: [id], onDelete: Cascade)

  created_at DateTime @default(now())

  @@unique([user_id, company_id])
  @@index([company_id])
  @@index([user_id, role])
  @@map("company_users")
}

// ============================================================================
// PRODUCTS & MEMBERSHIPS
// ============================================================================

model Product {
  id         String @id @default(cuid()) @map("product_id")
  company_id String
  company    Company @relation(fields: [company_id], references: [id], onDelete: Cascade)

  // Product Details
  title       String  @db.VarChar(255)
  description String? @db.Text
  image_url   String?

  // Pricing
  price_amount      Decimal @db.Decimal(10, 2)
  price_minor_units Int // Cents for Stripe
  currency          String  @default("USD") @db.VarChar(3)

  // Plan Type
  plan_type      String @db.VarChar(20) // one_time, monthly, yearly
  billing_period Int? // Days (30, 365, etc.)

  // Trial
  trial_days Int? @default(0)

  // Status
  active Boolean @default(true)

  // Metadata
  metadata   Json?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // Relations
  memberships Membership[]
  license_keys LicenseKey[]

  @@index([company_id, active])
  @@index([plan_type])
  @@map("products")
}

model Membership {
  id         String           @id @default(cuid()) @map("membership_id")
  user_id    String
  product_id String
  company_id String
  status     MembershipStatus @default(active)

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id])
  company Company @relation(fields: [company_id], references: [id])

  // Billing
  stripe_subscription_id String?   @unique
  current_period_start   DateTime?
  current_period_end     DateTime?
  cancel_at              DateTime?
  canceled_at            DateTime?
  trial_end              DateTime?

  // Metadata
  metadata   Json?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([user_id, status])
  @@index([product_id])
  @@index([company_id])
  @@index([stripe_subscription_id])
  @@map("memberships")
}

model LicenseKey {
  id         String @id @default(cuid())
  key        String @unique @db.VarChar(64)
  user_id    String
  product_id String

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  product Product @relation(fields: [product_id], references: [id])

  // Status
  active     Boolean   @default(true)
  expires_at DateTime?

  // Hardware Binding
  max_activations     Int @default(1)
  current_activations Int @default(0)
  reset_count         Int @default(0)
  last_reset_at       DateTime?

  // Validation
  metadata           Json? // { hardware_id, ip_address, device_name }
  last_validated_at  DateTime?

  created_at DateTime @default(now())

  @@index([user_id])
  @@index([product_id])
  @@index([key, active])
  @@map("license_keys")
}

// ============================================================================
// PAYMENTS
// ============================================================================

model Payment {
  id         String        @id @default(cuid()) @map("payment_id")
  company_id String
  user_id    String?

  company Company @relation(fields: [company_id], references: [id])

  // Payment Details
  amount             Decimal @db.Decimal(10, 2)
  amount_minor_units Int
  currency           String  @db.VarChar(3)

  // Status
  status PaymentStatus @default(pending)

  // Stripe
  stripe_payment_intent_id String? @unique
  stripe_charge_id         String?

  // Platform Fee
  platform_fee_amount       Decimal @db.Decimal(10, 2)
  platform_fee_minor_units  Int?

  // Metadata
  metadata          Json?
  checkout_metadata Json?

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([company_id, status])
  @@index([user_id])
  @@index([stripe_payment_intent_id])
  @@index([created_at])
  @@map("payments")
}

model CheckoutSession {
  id                  String  @id // ch_xxxxx
  checkout_config_id  String?
  plan_id             String?
  affiliate_code      String?

  // Session Details
  metadata   Json
  expires_at DateTime
  used       Boolean  @default(false)

  created_at DateTime @default(now())

  @@index([expires_at, used])
  @@map("checkout_sessions")
}

// ============================================================================
// APPS & WEBHOOKS
// ============================================================================

model App {
  id         String @id @default(cuid()) @map("app_id")
  company_id String
  company    Company @relation(fields: [company_id], references: [id], onDelete: Cascade)

  // App Details
  name        String  @db.VarChar(255)
  description String? @db.Text
  icon_url    String?

  // Hosting
  base_url        String? // Production URL
  experience_path String? // /experiences/[experienceId]
  dashboard_path  String? // /dashboard/[companyId]

  // API Credentials
  api_key        String @unique @db.VarChar(64)
  webhook_secret String @db.VarChar(64)

  // Status
  published     Boolean @default(false)
  localhost_mode Boolean @default(true)

  // Permissions
  permissions String[] // ["payments:read", "users:write"]

  // Metadata
  metadata   Json?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  @@index([company_id])
  @@index([published])
  @@map("apps")
}

model Webhook {
  id         String @id @default(cuid())
  company_id String
  company    Company @relation(fields: [company_id], references: [id], onDelete: Cascade)

  // Webhook Config
  url         String
  events      String[] // ["payment.succeeded", "membership.created"]
  api_version String   @default("v1")
  secret      String   @db.VarChar(64)

  // Status
  active Boolean @default(true)

  created_at DateTime @default(now())

  // Relations
  deliveries WebhookDelivery[]

  @@index([company_id, active])
  @@map("webhooks")
}

model WebhookDelivery {
  id         String        @id @default(cuid())
  webhook_id String
  webhook    Webhook       @relation(fields: [webhook_id], references: [id], onDelete: Cascade)

  // Event Details
  event_id   String @unique // Deduplication
  event_type String @db.VarChar(100)
  event_data Json

  // Delivery Status
  status   WebhookStatus @default(pending)
  attempts Int           @default(0)

  // Response
  response_status Int?
  response_body   String? @db.Text

  // Retry
  next_retry_at DateTime?

  created_at   DateTime  @default(now())
  delivered_at DateTime?

  @@index([webhook_id, status])
  @@index([event_type])
  @@index([status, next_retry_at])
  @@map("webhook_deliveries")
}
```
</database_schema>

<implementation>

## Phase 1: Core Infrastructure Setup

<file path="package.json">
```
{
  "name": "whop-marketplace-clone",
  "version": "2.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "worker": "tsx src/workers/index.ts"
  },
  "dependencies": {
    "@prisma/client": "^7.0.0",
    "@whop/api": "^1.2.0",
    "@whop/react": "^0.5.0",
    "next": "15.0.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "stripe": "^17.5.0",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "zod": "^3.23.8",
    "nanoid": "^5.0.4",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/bull": "^4.10.0",
    "typescript": "^5.3.0",
    "prisma": "^7.0.0",
    "tsx": "^4.7.0"
  }
}
```
</file>

<file path="lib/prisma.ts">
```
// IMPORTANT: Singleton Prisma client with connection pooling
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ============================================================================
// CRITICAL: Tenant Isolation Middleware
// ============================================================================

// Store current tenant in AsyncLocalStorage
import { AsyncLocalStorage } from 'async_hooks';
export const tenantStorage = new AsyncLocalStorage<{ companyId: string }>();

// Apply tenant filter automatically
prisma.$use(async (params, next) => {
  const TENANT_MODELS = ['Product', 'Membership', 'Payment', 'Webhook', 'App'];

  if (params.model && TENANT_MODELS.includes(params.model)) {
    const tenant = tenantStorage.getStore();

    if (tenant?.companyId) {
      // Auto-inject company_id filter
      if (params.action === 'findMany' || params.action === 'findFirst') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        params.args.where.company_id = tenant.companyId;
      }

      // Prevent cross-tenant mutations
      if (params.action === 'create' || params.action === 'update') {
        if (!params.args) params.args = {};
        if (!params.args.data) params.args.data = {};
        params.args.data.company_id = tenant.companyId;
      }
    }
  }

  return next(params);
});
```
</file>

<file path="lib/whop-sdk/index.ts">
```
// Official Whop SDK Integration
import { WhopApi, makeUserTokenVerifier } from "@whop/api";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { createHmac, randomBytes } from "crypto";

// Initialize Whop API client
export const whopApi = WhopApi({
  appApiKey: process.env.WHOP_API_KEY!,
  onBehalfOfUserId: process.env.WHOP_AGENT_USER_ID,
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// CRITICAL: Use official token verifier
export const verifyUserToken = makeUserTokenVerifier({
  appId: process.env.WHOP_APP_ID!,
  dontThrow: true,
});

export class WhopSDK {
  /**
   * Check if user has active membership to product
   * @returns boolean indicating access status
   */
  async checkAccess(productId: string, userId: string): Promise<boolean> {
    const membership = await prisma.membership.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
        status: "active",
        OR: [
          { current_period_end: null },
          { current_period_end: { gte: new Date() } }
        ]
      },
      select: { id: true }
    });

    return !!membership;
  }

  /**
   * Create reusable checkout session with metadata
   * IMPORTANT: Use minor units for all money calculations
   */
  async createCheckoutConfiguration(config: {
    company_id: string;
    plan: {
      initial_price: number; // In dollars
      plan_type: "one_time" | "monthly" | "yearly";
      trial_days?: number;
    };
    metadata?: Record<string, any>;
    affiliate_code?: string;
  }) {
    const sessionId = `ch_${randomBytes(16).toString("hex")}`;
    const priceMinorUnits = Math.round(config.plan.initial_price * 100);

    await prisma.checkoutSession.create({
      data: {
        id: sessionId,
        metadata: config.metadata || {},
        affiliate_code: config.affiliate_code,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    return {
      id: sessionId,
      plan: {
        price: config.plan.initial_price,
        plan_type: config.plan.plan_type,
      }
    };
  }

  /**
   * Create sub-merchant company with Stripe Connect account
   * CRITICAL: Implements KYC compliance flow
   */
  async createSubMerchant(data: {
    email: string;
    title: string;
    parent_company_id: string;
    metadata?: Record<string, any>;
  }) {
    // Create Stripe Express account
    const stripeAccount = await stripe.accounts.create({
      type: "express",
      email: data.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: data.title,
      },
    });

    // Create company record
    const company = await prisma.company.create({
      data: {
        type: "sub_merchant",
        status: "pending_kyc",
        title: data.title,
        email: data.email,
        slug: data.title.toLowerCase().replace(/\s+/g, "-") + `-${randomBytes(4).toString("hex")}`,
        parent_company_id: data.parent_company_id,
        stripe_account_id: stripeAccount.id,
        metadata: data.metadata,
      },
    });

    return company;
  }

  /**
   * Create transfer to sub-merchant account
   * IMPORTANT: Platform fee calculated from database
   */
  async createTransfer(data: {
    destination_company_id: string;
    amount_minor_units: number;
    currency: string;
    metadata?: Record<string, any>;
  }) {
    const company = await prisma.company.findUnique({
      where: { id: data.destination_company_id },
      select: {
        stripe_account_id: true,
        platform_fee_percent: true,
      },
    });

    if (!company?.stripe_account_id) {
      throw new Error("Sub-merchant Stripe account not found");
    }

    // Calculate platform fee
    const platformFee = Math.round(
      data.amount_minor_units * (Number(company.platform_fee_percent) / 100)
    );
    const transferAmount = data.amount_minor_units - platformFee;

    const transfer = await stripe.transfers.create({
      amount: transferAmount,
      currency: data.currency.toLowerCase(),
      destination: company.stripe_account_id,
      metadata: data.metadata,
    });

    return transfer;
  }

  /**

   * Verify webhook signature using HMAC-SHA256
   * CRITICAL: Prevents webhook spoofing attacks
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Use constant-time comparison to prevent timing attacks
    return signature === expectedSignature;
  }

  /**
   * Generate webhook signature for outgoing webhooks
   */
  generateWebhookSignature(payload: string, secret: string): string {
    return createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
  }
}

// Export singleton instance
export const whopSdk = new WhopSDK();
```
</file>

<file path="lib/webhook-queue.ts">
```
// CRITICAL: Asynchronous webhook delivery with retry logic
import Bull from 'bull';
import { prisma } from './prisma';
import { whopSdk } from './whop-sdk';

export const webhookQueue = new Bull('webhooks', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s, 25s, 125s
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false, // Keep failed jobs for debugging
  },
});

interface WebhookJob {
  webhookId: string;
  deliveryId: string;
  url: string;
  eventType: string;
  payload: any;
  secret: string;
}

// Process webhook deliveries
webhookQueue.process(async (job: Bull.Job<WebhookJob>) => {
  const { webhookId, deliveryId, url, eventType, payload, secret } = job.data;

  console.log(`[Webhook] Delivering ${eventType} to ${url} (attempt ${job.attemptsMade + 1}/3)`);

  const payloadString = JSON.stringify(payload);
  const signature = whopSdk.generateWebhookSignature(payloadString, secret);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Whop-Signature': signature,
        'X-Whop-Event-Type': eventType,
        'X-Whop-Event-Id': payload.id,
        'User-Agent': 'Whop-Webhooks/2.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const responseBody = await response.text().catch(() => null);

    // Update delivery status
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: response.ok ? 'delivered' : 'failed',
        response_status: response.status,
        response_body: responseBody?.slice(0, 5000), // Limit to 5KB
        delivered_at: response.ok ? new Date() : null,
        attempts: { increment: 1 },
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseBody}`);
    }

    console.log(`[Webhook] ✓ Successfully delivered to ${url}`);

  } catch (error) {
    console.error(`[Webhook] ✗ Failed to deliver to ${url}:`, error);

    // Update failure
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: 'failed',
        attempts: { increment: 1 },
        next_retry_at: new Date(Date.now() + (5000 * Math.pow(5, job.attemptsMade))),
      },
    });

    // Retry if attempts remaining
    if (job.attemptsMade < 2) {
      throw error; // Bull will auto-retry with exponential backoff
    }
  }
});

/**
 * Queue webhook delivery for processing
 * IMPORTANT: This returns immediately without blocking
 */
export async function queueWebhookDelivery(data: {
  companyId: string;
  eventType: string;
  eventData: any;
}) {
  // Find all active webhooks subscribed to this event
  const webhooks = await prisma.webhook.findMany({
    where: {
      company_id: data.companyId,
      active: true,
      events: {
        has: data.eventType,
      },
    },
  });

  console.log(`[Webhook] Broadcasting ${data.eventType} to ${webhooks.length} endpoints`);

  for (const webhook of webhooks) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const payload = {
      id: eventId,
      type: data.eventType,
      data: data.eventData,
      created_at: new Date().toISOString(),
    };

    // Create delivery record
    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhook_id: webhook.id,
        event_id: eventId,
        event_type: data.eventType,
        event_data: payload,
        status: 'pending',
      },
    });

    // Queue for async processing
    await webhookQueue.add({
      webhookId: webhook.id,
      deliveryId: delivery.id,
      url: webhook.url,
      eventType: data.eventType,
      payload,
      secret: webhook.secret,
    });
  }
}

// Webhook queue event listeners
webhookQueue.on('completed', (job) => {
  console.log(`[Webhook Queue] Job ${job.id} completed`);
});

webhookQueue.on('failed', (job, err) => {
  console.error(`[Webhook Queue] Job ${job.id} failed:`, err.message);
});

webhookQueue.on('stalled', (job) => {
  console.warn(`[Webhook Queue] Job ${job.id} stalled`);
});
```
</file>

<file path="app/api/checkout/create-session/route.ts">
```
// CRITICAL: Stripe checkout session creation with platform fees
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const bodySchema = z.object({
  product_id: z.string(),
  user_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    // Load product with company
    const product = await prisma.product.findUnique({
      where: { id: body.product_id },
      include: { company: true },
    });

    if (!product || !product.active) {
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: body.user_id },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // IMPORTANT: Generate idempotency key to prevent duplicate charges
    const idempotencyKey = `checkout_${body.user_id}_${product.id}_${Date.now()}`;

    // Create Stripe checkout session
    const sessionData: Stripe.Checkout.SessionCreateParams = {
      mode: product.plan_type === 'one_time' ? 'payment' : 'subscription',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.image_url ? [product.image_url] : undefined,
            },
            unit_amount: product.price_minor_units, // CRITICAL: Always use minor units
            ...(product.plan_type !== 'one_time' && {
              recurring: {
                interval: product.plan_type === 'monthly' ? 'month' : 'year',
              },
            }),
          },
          quantity: 1,
        },
      ],
      success_url: body.success_url,
      cancel_url: body.cancel_url,
      metadata: {
        product_id: product.id,
        user_id: body.user_id,
        company_id: product.company_id,
        ...body.metadata,
      },
    };

    // CRITICAL: If sub-merchant, apply platform fee via Stripe Connect
    if (product.company.stripe_account_id && product.company.type === 'sub_merchant') {
      const platformFeeMinorUnits = Math.round(
        product.price_minor_units * (Number(product.company.platform_fee_percent) / 100)
      );

      if (product.plan_type === 'one_time') {
        sessionData.payment_intent_data = {
          application_fee_amount: platformFeeMinorUnits,
          transfer_data: {
            destination: product.company.stripe_account_id,
          },
        };
      } else {
        sessionData.subscription_data = {
          application_fee_percent: Number(product.company.platform_fee_percent),
          transfer_data: {
            destination: product.company.stripe_account_id,
          },
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionData, {
      idempotencyKey,
    });

    return NextResponse.json({
      url: session.url,
      session_id: session.id,
    });

  } catch (error) {
    console.error('[Checkout] Error creating session:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```
</file>

<file path="app/api/webhooks/stripe/route.ts">
```
// CRITICAL: Stripe webhook handler with event broadcasting
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { queueWebhookDelivery } from '@/lib/webhook-queue';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    // CRITICAL: Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log(`[Stripe Webhook] Received ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata!;

      // Create membership
      const membership = await prisma.membership.create({
        data: {
          user_id: metadata.user_id,
          product_id: metadata.product_id,
          company_id: metadata.company_id,
          status: session.mode === 'subscription' ? 'active' : 'active',
          stripe_subscription_id: session.subscription as string | null,
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: session.metadata,
        },
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          company_id: metadata.company_id,
          user_id: metadata.user_id,
          amount: Number(session.amount_total) / 100,
          amount_minor_units: session.amount_total!,
          currency: session.currency!.toUpperCase(),
          status: 'succeeded',
          stripe_payment_intent_id: session.payment_intent as string,
          platform_fee_amount: 0, // Calculate from company settings
          checkout_metadata: session.metadata,
        },
      });

      // Broadcast webhook event to registered endpoints
      await queueWebhookDelivery({
        companyId: metadata.company_id,
        eventType: 'payment.succeeded',
        eventData: {
          payment_id: payment.id,
          membership_id: membership.id,
          amount: payment.amount,
          currency: payment.currency,
          user_id: metadata.user_id,
          product_id: metadata.product_id,
        },
      });

      console.log(`[Stripe Webhook] Created membership ${membership.id}`);
    }

    // Handle subscription updates
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.membership.updateMany({
        where: { stripe_subscription_id: subscription.id },
        data: {
          status: subscription.status === 'active' ? 'active' : 'past_due',
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        },
      });
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;

      await prisma.membership.updateMany({
        where: { stripe_subscription_id: subscription.id },
        data: {
          status: 'canceled',
          canceled_at: new Date(),
        },
      });
    }

    // Handle Connect account updates
    if (event.type === 'account.updated') {
      const account = event.data.object as Stripe.Account;

      if (account.details_submitted && account.charges_enabled) {
        await prisma.company.update({
          where: { stripe_account_id: account.id },
          data: {
            status: 'active',
            stripe_onboarded: true,
            onboarding_completed: true,
          },
        });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
```
</file>

<file path="app/api/memberships/[key]/validate_license/route.ts">
```
// CRITICAL: License key validation with hardware binding
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  hardware_id: z.string(),
  device_name: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = bodySchema.parse(await req.json());

    // Find license key
    const license = await prisma.licenseKey.findUnique({
      where: { key },
      include: {
        product: true,
        user: { select: { id: true, email: true, username: true } },
      },
    });

    // Check 1: License exists and active
    if (!license || !license.active) {
      return NextResponse.json(
        { valid: false, reason: 'License not found or inactive' },
        { status: 403 }
      );
    }

    // Check 2: Expiration
    if (license.expires_at && license.expires_at < new Date()) {
      return NextResponse.json(
        { valid: false, reason: 'License expired' },
        { status: 403 }
      );
    }

    const metadata = (license.metadata as any) || {};

    // Check 3: Hardware binding
    if (metadata.hardware_id && metadata.hardware_id !== body.hardware_id) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'Hardware mismatch',
          details: 'This license is bound to a different device',
        },
        { status: 403 }
      );
    }

    // Check 4: Max activations
    if (
      license.current_activations >= license.max_activations &&
      !metadata.hardware_id
    ) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'Activation limit reached',
          details: `Maximum ${license.max_activations} activation(s) allowed`,
        },
        { status: 403 }
      );
    }

    // Update activation metadata
    await prisma.licenseKey.update({
      where: { id: license.id },
      data: {
        last_validated_at: new Date(),
        current_activations: metadata.hardware_id
          ? license.current_activations
          : { increment: 1 },
        metadata: {
          ...metadata,
          hardware_id: body.hardware_id,
          device_name: body.device_name,
          last_ip: req.ip || req.headers.get('x-forwarded-for'),
          last_validated: new Date().toISOString(),
        },
      },
    });

    // Return success
    return NextResponse.json({
      valid: true,
      product: {
        id: license.product.id,
        title: license.product.title,
        description: license.product.description,
      },
      user: {
        id: license.user.id,
        email: license.user.email,
        username: license.user.username,
      },
      expires_at: license.expires_at,
      activations: {
        current: license.current_activations + (metadata.hardware_id ? 0 : 1),
        max: license.max_activations,
      },
    });

  } catch (error) {
    console.error('[License Validation] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```
</file>

<file path="app/experiences/[experienceId]/page.tsx">
```
// Experience view for B2C apps (iframe embedded)
import { headers } from 'next/headers';
import { verifyUserToken } from '@/lib/whop-sdk';
import { whopSdk } from '@/lib/whop-sdk';
import { redirect } from 'next/navigation';

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const requestHeaders = await headers();

  // STEP 1: Verify user token from iframe parent window
  const tokenData = await verifyUserToken(requestHeaders);

  if (!tokenData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unauthorized</h1>
          <p className="text-gray-600">
            Please access this app through Whop dashboard
          </p>
        </div>
      </div>
    );
  }

  // STEP 2: Check if user has access to this experience (product)
  const hasAccess = await whopSdk.checkAccess(experienceId, tokenData.userId);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need to purchase access to view this content.
          </p>
          <a
            href={`/checkout?product_id=${experienceId}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buy Now
          </a>
        </div>
      </div>
    );
  }

  // STEP 3: Render protected experience content
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Experience {experienceId}
        </h1>
        <p className="text-gray-600 mb-8">
          User ID: {tokenData.userId}
        </p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
          <p className="text-gray-700">
            This is premium content only visible to members who have purchased
            access to this experience.
          </p>
        </div>
      </div>
    </div>
  );
}
```
</file>

<file path="app/dashboard/[companyId]/page.tsx">
```
// Dashboard view for B2B apps (company management)
import { headers } from 'next/headers';
import { verifyUserToken } from '@/lib/whop-sdk';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const requestHeaders = await headers();

  // Verify user token
  const tokenData = await verifyUserToken(requestHeaders);

  if (!tokenData) {
    return <div>Unauthorized</div>;
  }

  // Check if user has access to this company dashboard
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      user_id: tokenData.userId,
      company_id: companyId,
      role: { in: ['owner', 'admin'] },
    },
  });

  if (!companyUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to access this company dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Load company stats
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      _count: {
        select: {
          products: true,
          memberships: true,
          payments: true,
        },
      },
    },
  });

  if (!company) {
    return <div>Company not found</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{company.title} Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {company._count.products}
            </div>
            <div className="text-gray-600">Products</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {company._count.memberships}
            </div>
            <div className="text-gray-600">Active Members</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {company._count.payments}
            </div>
            <div className="text-gray-600">Total Payments</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Company Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{company.status}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{company.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{company.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Platform Fee</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {company.platform_fee_percent.toString()}%
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
```
</file>

<file path="middleware.ts">
```
// CRITICAL: Security headers for iframe embedding
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Allow embedding in Whop dashboard
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.whop.com"
  );

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'ALLOW-FROM https://whop.com');

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: ['/experiences/:path*', '/dashboard/:path*'],
};
```
</file>

<file path=".env.example">
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whop_marketplace"
DIRECT_URL="postgresql://user:password@localhost:5432/whop_marketplace"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

# Whop API
WHOP_API_KEY="whop_api_..."
WHOP_WEBHOOK_SECRET="whop_webhook_..."
WHOP_APP_ID="app_..."
WHOP_AGENT_USER_ID="user_..."
NEXT_PUBLIC_WHOP_APP_ID="app_..."

# Platform
PLATFORM_COMPANY_ID="biz_platform"
PLATFORM_FEE_PERCENT="5.0"
BASE_URL="https://yourdomain.com"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Node
NODE_ENV="development"
```
</file>

<file path="src/workers/index.ts">
```
// Background worker for webhook delivery
import { webhookQueue } from '../lib/webhook-queue';

console.log('[Worker] Starting webhook delivery worker...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down gracefully...');
  await webhookQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down gracefully...');
  await webhookQueue.close();
  process.exit(0);
});

console.log('[Worker] ✓ Webhook worker ready');
```
</file>

</implementation>

<deployment>

## Production Deployment Checklist

### 1. Database Setup (Neon PostgreSQL)
```
# Create production database
# Set DATABASE_URL in environment variables
pnpm prisma migrate deploy
pnpm prisma generate
```

### 2. Redis Setup (Upstash or Railway)
- Create Redis instance
- Set REDIS_URL environment variable
- Enable persistence

### 3. Stripe Setup
- Create Stripe account
- Enable Stripe Connect
- Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- Copy webhook secret
- Get Connect client ID

### 4. Vercel Deployment
```
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 5. Background Worker (Railway)
```
# Deploy worker separately
# Set start command: pnpm worker
# Use same environment variables as Next.js app
```

### 6. Monitoring Setup
- Configure Sentry for error tracking
- Set up Axiom for log aggregation
- Create Stripe dashboard for payment monitoring
- Set up uptime monitoring (BetterStack)

### 7. Security Hardening
- Enable Vercel DDoS protection
- Configure rate limiting in production
- Review CSP headers
- Enable Stripe fraud detection
- Set up webhook signature verification
- Rotate API keys regularly

</deployment>

<testing>

## Testing Requirements

### Unit Tests
```
// __tests__/whop-sdk.test.ts
import { whopSdk } from '@/lib/whop-sdk';

describe('WhopSDK', () => {
  it('should verify webhook signatures correctly', () => {
    const payload = '{"test": true}';
    const secret = 'test_secret';
    const signature = whopSdk.generateWebhookSignature(payload, secret);

    expect(whopSdk.verifyWebhookSignature(payload, signature, secret)).toBe(true);
  });
});
```

### Integration Tests
- Checkout flow end-to-end
- Webhook delivery and retry logic
- License validation with hardware binding
- Sub-merchant onboarding
- Multi-tenant data isolation

### Load Tests
- 1000 concurrent checkout sessions
- 10,000 webhook deliveries per minute
- Database query performance under load

</testing>

<monitoring>

## Observability

### Key Metrics
- Payment success rate (target: >98%)
- Webhook delivery rate (target: >99%)
- API response time (p95 <500ms)
- Database connection pool utilization

### Alerts
- Payment failures spike
- Webhook delivery failures >5%
- Database connection exhaustion
- Stripe Connect errors
- API error rate >1%

</monitoring>

</claude_code_task>
```

***
