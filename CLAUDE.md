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
| **Email Utilities** | `lib/email.ts` |
| **Auth Actions** | `app/actions/auth.ts` |
| **Profile Actions** | `app/actions/profile.ts` |
| **Whop SDK** | `lib/whop-sdk/index.ts` |
| **Security Middleware** | `middleware.ts` |
| **Tailwind Design System** | `app/globals.css` |
| **UI Design Guide** | `.claude/skills/ui-design.md` |
| **Landing Page** | `app/page.tsx` |
| **Site Header** | `components/site-header.tsx` |
| **Login/Register** | `app/login/page.tsx`, `app/register/page.tsx` |
| **Profile Page** | `app/profile/page.tsx` |
| **Email Verification** | `app/verify-email/page.tsx` |
| **Google OAuth** | `app/api/auth/google/callback/route.ts` |
| **Dashboard Selector** | `app/dashboard/page.tsx` |
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
import { registerUser, loginUser, requireAuth, getCurrentSession } from '@/lib/auth';

// Register new user
const session = await registerUser({ email, password, name });

// Login existing user
const session = await loginUser({ email, password });

// Get current session (returns null if not logged in)
const session = await getCurrentSession();

// Protect routes (redirects to /login if not authenticated)
const user = await requireAuth();

// Server actions (app/actions/auth.ts)
import { loginAction, registerAction, logoutAction } from '@/app/actions/auth';

// Use in forms
const result = await loginAction(formData);
if (result.success) {
  router.push('/');
} else {
  setError(result.error);
}

// Logout (clears session cookie)
await logoutAction();

// Whop iframe auth (for B2C experiences)
import { authenticateWhopIframe } from '@/lib/auth';
const whopSession = await authenticateWhopIframe(token);
```

### Email Verification & Password Reset
```typescript
// Generate and send verification email (lib/email.ts)
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';

const token = await generateVerificationToken(userId);
await sendVerificationEmail(email, token);

// Verify token
import { verifyEmailToken } from '@/lib/email';
const isValid = await verifyEmailToken(token); // Returns true/false

// Send password reset email
import { sendPasswordResetEmail } from '@/lib/email';
await sendPasswordResetEmail(email, resetToken);
```

### Profile Management
```typescript
// Update profile (app/actions/profile.ts)
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile';

// Update name/username
const result = await updateProfileAction(formData);

// Change password
const result = await changePasswordAction(formData);
// Requires current password verification
```

### OAuth Integration
```typescript
// Google OAuth flow
// 1. User clicks "Login with Google" button
<Link href={`https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/google/callback')}&response_type=code&scope=openid email profile&access_type=offline&prompt=consent`}>
  Login with Google
</Link>

// 2. Callback handler processes OAuth response
// app/api/auth/google/callback/route.ts handles:
// - Token exchange
// - User info retrieval
// - User creation/lookup
// - Session creation
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
JWT_SECRET="your-secure-secret"   # For password-based auth (min 32 chars)

# App Config
BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# OAuth Providers
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_PROJECT_ID="your-project-id"

# NEXT_PUBLIC_APPLE_CLIENT_ID="your-apple-service-id"  # Optional
# APPLE_CLIENT_SECRET="your-apple-secret"              # Optional

# Email Service (Resend)
RESEND_API_KEY="re_..."           # For email verification & password reset
```

See `.env.example` for complete list.

---

## Security Checklist

**NEVER:**
- ❌ Floating-point money
- ❌ Manual JWT parsing (use Whop SDK token verifier)
- ❌ Queries without `company_id` (tenant-scoped models)
- ❌ Sync webhooks
- ❌ Skip signature verification
- ❌ Use `request.ip` (Next.js 15 doesn't support it)
- ❌ Store passwords in plaintext
- ❌ Skip email verification for sensitive operations
- ❌ Expose OAuth secrets in client code

**ALWAYS:**
- ✅ Cents for money
- ✅ Idempotency keys
- ✅ HMAC signatures via Whop SDK webhook validator
- ✅ Tenant isolation
- ✅ Zod validation
- ✅ Use `request.headers.get('x-forwarded-for')` for IP detection
- ✅ Verify Whop tokens with official SDK, never manually
- ✅ Hash passwords with bcrypt (10+ rounds)
- ✅ HTTP-only secure cookies for sessions
- ✅ SameSite cookie protection
- ✅ Server-side validation for all forms
- ✅ Verify current password before changes
- ✅ Check uniqueness for email/username

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

### ✅ Phase 6: Authentication & UI (COMPLETED)
- [x] **UI Design System**
  - [x] Neon cyberpunk theme (primary: #00ff9d, accent: #ff006e)
  - [x] Custom fonts (Sora + JetBrains Mono)
  - [x] CSS animations (slideInUp, glow, float, pulse-glow)
  - [x] Design guide (`.claude/skills/ui-design.md`)

- [x] **Landing Page** (`app/page.tsx`)
  - [x] Hero section with animated backgrounds
  - [x] Features grid (6 cards)
  - [x] Pricing tiers (3 plans)
  - [x] CTA section
  - [x] Footer with links

- [x] **Authentication System**
  - [x] Login/Register pages (shadcn login-03 block)
  - [x] Server actions (`app/actions/auth.ts`)
  - [x] Password hashing (bcrypt, 10 rounds)
  - [x] JWT sessions (7-day expiry)
  - [x] HTTP-only secure cookies
  - [x] Protected route helper (`requireAuth`)

- [x] **OAuth Integration**
  - [x] Google OAuth (fully activated)
  - [x] Apple Sign In (placeholder structure)
  - [x] Token exchange & user creation
  - [x] Callback handlers

- [x] **Email Verification**
  - [x] Token generation (nanoid, 24h expiry)
  - [x] Resend email service integration
  - [x] Verification page (`/verify-email`)
  - [x] Resend button on profile
  - [x] Email verified badge
  - [x] HTML email templates (cyberpunk theme)

- [x] **Profile Management**
  - [x] Profile page (`/profile`)
  - [x] Update name/username
  - [x] Change password (with current password check)
  - [x] Email verification banner
  - [x] Avatar with fallback

- [x] **Navigation**
  - [x] Dynamic site header (`components/site-header.tsx`)
  - [x] Logout button with loading state
  - [x] Auth-based menu items
  - [x] Glassmorphism design

- [x] **Dashboard**
  - [x] Company selector (`/dashboard`)
  - [x] Role badges (Owner/Admin/Member)
  - [x] Company stats display
  - [x] Auto-redirect for single company
  - [x] Empty state with CTA

### 🎯 Next: Deploy & Production Setup
- [ ] Configure production environment variables
- [ ] Set up Stripe Connect onboarding
- [ ] Deploy to Vercel/production
- [ ] Configure Redis for Bull queues
- [ ] Set up monitoring & logging
- [ ] Configure custom domain for Resend emails
- [ ] Implement password reset flow
- [ ] Add 2FA/MFA (optional)
- [ ] Set up activity logging (optional)

---

## 🎨 Design System

**Theme:** Neon Cyberpunk
**Colors:**
- Primary: `#00ff9d` (Electric Mint)
- Accent: `#ff006e` (Hot Magenta)
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Background: `#0a0a0f` → `#12121a`

**Typography:**
- Headings: **Sora** (bold, distinctive)
- Code/Labels: **JetBrains Mono**
- Terminal-style labels (e.g., `EMAIL_ADDRESS`, `[BUTTON_TEXT]`)

**Animations:**
- `slideInUp` - Staggered fade-in from bottom
- `glow` - Pulsing glow effect
- `float` - Gentle floating motion
- `pulse-glow` - Button hover glow

**Components:**
- Glassmorphism navigation
- Animated gradient backgrounds
- Grid patterns
- Glowing borders on hover
- Terminal-style UI elements
- Cyberpunk button styles

See `.claude/skills/ui-design.md` for complete guide.

---

**Full docs:** `Whop-saas-implementations-plan.md` | `.claude/skills.md` | `FEATURES.md`
