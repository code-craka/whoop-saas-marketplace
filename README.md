# 🚀 Whop SaaS Marketplace

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![React](https://shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Connect-635BFF?style=for-the-badge&logo=stripe)

**Production-grade SaaS marketplace clone inspired by Whop ($400M valuation)**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🏢 Multi-Tenant Architecture
- **Automatic tenant isolation** with company_id injection
- **B2B & B2C support** - Dashboards for merchants and customer experiences
- **Role-based access control** - Owner, Admin, Member roles

### 💳 Payments & Subscriptions
- **Stripe Connect** integration for marketplace payments
- **Subscription management** - Monthly, yearly, one-time plans
- **License key system** - Hardware-bound activation limits
- **Platform fee distribution** - Configurable revenue sharing

### 🔐 Authentication & Security
- **Password-based auth** - bcrypt hashing, JWT sessions
- **OAuth integration** - Google Sign-In (Apple ready)
- **Email verification** - Resend integration with custom templates
- **Multi-tenant isolation** - Zero data leakage between companies

### 🎨 UI/UX
- **Neon cyberpunk theme** - Electric mint (#00ff9d) + hot magenta (#ff006e)
- **Glassmorphism design** - Modern, premium aesthetic
- **Fully responsive** - Mobile-first approach
- **Tailwind v4** - Latest styling capabilities

### 🔔 Webhooks & Events
- **Outgoing webhooks** - HMAC-SHA256 signed events
- **Stripe webhooks** - Payment intent, subscription events
- **Retry logic** - Exponential backoff (5s → 25s → 125s)
- **Event tracking** - Database-backed delivery logs

### 📊 Developer Experience
- **Type-safe** - 100% TypeScript with strict mode
- **Zero runtime errors** - Zod validation everywhere
- **Hot reload** - Next.js 16 with Turbopack
- **Database GUI** - Prisma Studio integration

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React Server Components, App Router
- **React 19** - Latest features and optimizations
- **Tailwind CSS v4** - Modern utility-first styling
- **Custom fonts** - Sora (headings), JetBrains Mono (code)

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma 7** - Type-safe ORM with PostgreSQL adapter
- **PostgreSQL** - Primary database with connection pooling
- **Zod** - Runtime schema validation

### Payments & Auth
- **Stripe Connect** - Marketplace payments
- **Whop SDK** - Platform integration
- **bcrypt** - Password hashing (10 rounds)
- **Resend** - Transactional emails

### Infrastructure
- **Vercel** - Deployment platform (recommended)
- **Neon/Supabase** - Managed PostgreSQL
- **Turbopack** - Next.js bundler

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20.9.0+ (v22.15.0 recommended)
- **pnpm** 8.0+
- **PostgreSQL** 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whop-saas-marketplace.git
   cd whop-saas-marketplace
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in required variables:
   ```env
   DATABASE_URL="postgresql://..."
   STRIPE_SECRET_KEY="sk_..."
   WHOP_API_KEY="apik_..."
   JWT_SECRET="your-32-char-secret"
   RESEND_API_KEY="re_..."
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

4. **Set up the database**
   ```bash
   pnpm db:push        # Sync schema
   pnpm prisma generate # Generate client
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
whop-saas-marketplace/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── api/               # API routes
│   ├── dashboard/         # B2B dashboards
│   ├── experiences/       # B2C product pages
│   └── actions/           # Server actions
├── components/            # React components
├── lib/                   # Core utilities
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Database singleton (Prisma 7)
│   ├── stripe.ts         # Stripe integration
│   ├── email.ts          # Email utilities
│   └── webhook-queue.ts  # Webhook delivery
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── generated/        # Prisma client (auto-generated)
├── public/               # Static assets
└── .claude/              # AI development guides
```

---

## 🔑 Key Features Breakdown

### Multi-Tenant Isolation
Every database query is automatically filtered by `company_id` using Prisma middleware:

```typescript
import { runInTenantContext } from '@/lib/prisma';

await runInTenantContext({ companyId: 'company_123' }, async () => {
  // All queries auto-filtered by company_id
  const products = await prisma.product.findMany();
  const payments = await prisma.payment.findMany();
});
```

### Stripe Connect Flow
1. Merchant creates account → Platform fee configured
2. Customer purchases → Payment split automatically
3. Webhook triggers → Update membership status
4. License key generated → Hardware-bound activation

### License Key Validation
```typescript
POST /api/memberships/{key}/validate_license

{
  "hardware_id": "ABC123",
  "device_name": "MacBook Pro"
}

→ Returns: { valid: true, product, user, activations }
```

---

## 🧪 Development

### Quality Checks
```bash
pnpm lint              # ESLint
npx tsc --noEmit       # TypeScript check
```

### Database
```bash
pnpm db:push           # Sync schema (dev)
pnpm db:migrate        # Create migration
pnpm db:studio         # Open Prisma Studio
pnpm prisma generate   # Regenerate client
```

### Build
```bash
pnpm build             # Production build
pnpm start             # Run production server
```

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI development guide (optimized for Claude)
- **[FEATURES.md](./FEATURES.md)** - Complete feature list
- **[.claude/skills/ui-design.md](./.claude/skills/ui-design.md)** - Design system guide
- **[Whop-saas-implementations-plan.md](./Whop-saas-implementations-plan.md)** - Implementation roadmap

---

## 🔒 Security

### Built-in Protections
- ✅ **Multi-tenant isolation** - Zero cross-tenant data leakage
- ✅ **Password hashing** - bcrypt with 10+ rounds
- ✅ **HTTP-only cookies** - Session hijacking prevention
- ✅ **CSRF protection** - SameSite cookie policy
- ✅ **Webhook signatures** - HMAC-SHA256 verification
- ✅ **SQL injection** - Parameterized queries via Prisma
- ✅ **XSS protection** - React auto-escaping
- ✅ **Type safety** - 100% TypeScript, zero `any` types

### Best Practices
- All money stored in **cents** (integers) to prevent rounding errors
- **Idempotency keys** on all Stripe operations
- **Zod validation** on all API inputs
- **Tenant context** required for all database operations

---

## 🎨 Design System

### Colors
- **Primary:** `#00ff9d` (Electric Mint)
- **Accent:** `#ff006e` (Hot Magenta)
- **Background:** `#0a0a0f` → `#12121a`
- **Warning:** `#f59e0b`
- **Error:** `#ef4444`

### Typography
- **Headings:** Sora (bold, distinctive)
- **Code/Labels:** JetBrains Mono
- **Terminal-style:** `[BUTTON_TEXT]`, `EMAIL_ADDRESS`

### Components
All components follow the neon cyberpunk aesthetic with:
- Glassmorphism effects
- Glowing borders on hover
- Smooth animations
- Grid patterns
- Terminal-style UI elements

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables
Ensure all production environment variables are set in Vercel dashboard:
- `DATABASE_URL` (use connection pooling URL)
- `STRIPE_SECRET_KEY` (live key)
- `JWT_SECRET` (32+ random chars)
- All OAuth credentials

### Post-Deployment
1. Run database migrations: `pnpm db:migrate`
2. Configure Stripe webhook URL
3. Set up custom domain for emails (Resend)
4. Enable monitoring and logging

---

## 📊 Database Schema

### Core Models (13 total)
- **Company** - Merchants/platform accounts
- **User** - Customers and staff
- **CompanyUser** - M2M relationship with roles
- **Product** - Offerings (one-time, monthly, yearly)
- **Membership** - Active subscriptions
- **LicenseKey** - Hardware-bound licenses
- **Payment** - Transaction records
- **Webhook** - Outgoing webhook configs
- **WebhookDelivery** - Delivery logs
- **App** - Platform apps/integrations

### Tenant-Scoped Models
**Automatic `company_id` filtering:**
Product, Membership, Payment, Webhook, App, CompanyUser, WebhookDelivery

---

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

### Development Workflow
1. Create feature branch
2. Make changes
3. Run `pnpm lint && npx tsc --noEmit`
4. Commit with conventional commits
5. Open PR

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 🙏 Acknowledgments

- **Whop** - Inspiration for marketplace architecture
- **Stripe** - Payment infrastructure
- **Vercel** - Deployment platform
- **Prisma** - Database toolkit

---

## 📧 Contact

**Questions?** Open an issue or reach out!

---

<div align="center">

**Built with ❤️ using Next.js 16, React 19, Prisma 7, and TypeScript**

⭐️ Star this repo if you find it helpful!

</div>
