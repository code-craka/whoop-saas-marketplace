# Team Onboarding Guide - WhopSaaS API

Quick guide for sharing API documentation with your team.

---

## 🚀 **Quick Access Links**

### **📚 Interactive API Documentation**
```
http://localhost:3000/api/docs
```
**Features:**
- Try all endpoints directly in browser
- See request/response examples
- Test with real data
- No setup required

### **📄 OpenAPI Specification**
```
http://localhost:3000/api/openapi
```
**Use for:**
- Generate SDKs in any language
- Import to Postman/Insomnia
- API testing tools
- Documentation generation

### **📖 Developer Guide**
```
/API_DOCUMENTATION.md
```
**Includes:**
- Authentication guide
- Quick start examples
- Error handling
- Best practices
- Troubleshooting

---

## 👥 **Share with Team**

### **For Frontend Developers**

**Share this Slack/Discord message:**

```
🎉 WhopSaaS API is ready!

📚 **Interactive Docs:** http://localhost:3000/api/docs
📖 **Developer Guide:** See API_DOCUMENTATION.md in repo

**TypeScript SDK:**
import { WhopSaaSClient } from '@/lib/sdk/client';

const client = new WhopSaaSClient();
const products = await client.products.list({ company_id: 'biz_123' });

**Documentation:**
- Full TypeScript types included
- All endpoints covered
- Examples for every operation

**Questions?** Check /lib/sdk/README.md
```

---

### **For Backend Developers**

**Share this Slack/Discord message:**

```
🚀 WhopSaaS API Documentation

**REST API Reference:**
http://localhost:3000/api/docs

**OpenAPI Spec:**
http://localhost:3000/api/openapi

**Key Features:**
- Full CRUD for Products, Companies, Memberships, Webhooks
- Multi-tenant isolation (company_id scoping)
- Role-based access control (owner/admin/member)
- Money in minor units (cents) - NO floating-point errors
- Cookie-based authentication
- Rate limiting: 100 req/min per IP

**Generate SDK:**
```bash
./scripts/generate-sdk.sh
```

**Security:**
- All requests require authentication
- HMAC-SHA256 webhook signatures
- Tenant isolation via Prisma middleware

**Questions?** See API_DOCUMENTATION.md
```

---

### **For QA/Testing Team**

**Share this Slack/Discord message:**

```
🧪 WhopSaaS API Testing Guide

**Swagger UI (Try APIs):**
http://localhost:3000/api/docs

**Postman Setup:**
1. Download spec: http://localhost:3000/api/openapi
2. Postman → Import → Upload file
3. Create environment:
   - base_url: http://localhost:3000
   - company_id: biz_123
4. Login via web app first (gets cookie)
5. Test away!

**Test Accounts:**
- Admin: admin@example.com / password123
- Member: member@example.com / password123

**Rate Limit:** 100 req/min per IP
**Test Data:** Use company_id=biz_123 for testing

**Questions?** See API_DOCUMENTATION.md
```

---

## 📧 **Email Template**

```
Subject: WhopSaaS API Documentation Available

Hi Team,

The WhopSaaS API documentation is now available! 🎉

🔗 Quick Links:
• Interactive Docs: http://localhost:3000/api/docs
• Developer Guide: See API_DOCUMENTATION.md in repo
• TypeScript SDK: /lib/sdk/client.ts

📚 What's Available:
✅ Products API - Manage subscription plans
✅ Companies API - Multi-tenant management
✅ Memberships API - User subscriptions
✅ Webhooks API - Event notifications

🛠️ Getting Started:
1. Login to http://localhost:3000
2. Visit http://localhost:3000/api/docs
3. Try the "List Products" endpoint
4. Check examples in API_DOCUMENTATION.md

💡 For Developers:
import { WhopSaaSClient } from '@/lib/sdk/client';

const client = new WhopSaaSClient();
const products = await client.products.list({ company_id: 'biz_123' });

📖 Full docs: /API_DOCUMENTATION.md
📦 SDK docs: /lib/sdk/README.md

Questions? Reply to this email or ask in #engineering.

Happy coding!
```

---

## 🎓 **Onboarding Checklist**

### **For New Developers**

- [ ] Clone repository
- [ ] Run `pnpm install`
- [ ] Copy `.env.example` to `.env.local`
- [ ] Run `pnpm dev`
- [ ] Visit http://localhost:3000/api/docs
- [ ] Read `/API_DOCUMENTATION.md`
- [ ] Try SDK examples from `/lib/sdk/README.md`
- [ ] Create test API request in Postman
- [ ] Review security patterns in CLAUDE.md
- [ ] Ask questions in #engineering

---

## 📱 **Notion/Confluence Page Template**

```markdown
# WhopSaaS API Documentation

## Quick Links
- [Interactive API Docs](http://localhost:3000/api/docs)
- [OpenAPI Spec](http://localhost:3000/api/openapi)
- [Developer Guide](link-to-repo/API_DOCUMENTATION.md)

## Available APIs
### Products API
Manage subscription plans and one-time products
- List, create, update, delete products
- Pricing in minor units (cents)
- Trial periods supported

### Companies API
Multi-tenant company management
- Create sub-merchant companies
- Manage platform fees
- Role-based access

### Memberships API
User subscription management
- View active subscriptions
- Cancel/pause memberships
- Admin controls

### Webhooks API
Real-time event notifications
- 8 event types (payments, memberships, products)
- HMAC signature verification
- Automatic retries

## TypeScript SDK
```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';

const client = new WhopSaaSClient();
const { products } = await client.products.list({
  company_id: 'biz_123'
});
```

## Authentication
- Cookie-based session tokens
- 7-day expiration
- HTTP-only secure cookies

## Rate Limits
- 100 requests per minute per IP
- Returns 429 when exceeded
- Retry-After header included

## Support
- Questions: #engineering Slack channel
- Issues: GitHub repository
- Documentation: /API_DOCUMENTATION.md
```

---

## 🎬 **Demo Video Script**

### **5-Minute Team Demo**

**1. Introduction (30s)**
> "Today I'll show you our new WhopSaaS API documentation. We have interactive docs, a TypeScript SDK, and full examples for all endpoints."

**2. Show Interactive Docs (1m)**
> "Visit localhost:3000/api/docs. Here's the Swagger UI. Let's try the Products API..."
- Click "List Products"
- Click "Try it out"
- Enter company_id
- Execute
- Show response

**3. Show TypeScript SDK (1.5m)**
> "For frontend developers, we have a TypeScript SDK. Open lib/sdk/client.ts..."
- Show type definitions
- Show usage example
- Run in console
- Show autocomplete

**4. Show Developer Guide (1m)**
> "The API_DOCUMENTATION.md has everything. Authentication, examples, troubleshooting..."
- Scroll through sections
- Show cURL examples
- Show error codes

**5. Postman Demo (1m)**
> "For testing, import the OpenAPI spec into Postman..."
- Download spec
- Import to Postman
- Show collections
- Run a request

**6. Questions (30s)**
> "Check the docs for more. Questions in #engineering. Happy coding!"

---

## 💬 **FAQ for Team**

### **Q: How do I authenticate API requests?**
A: Login via the web app first. Session cookie is automatically sent with requests.

### **Q: Can I use the API from external services?**
A: Yes! Get a session token and pass it as a cookie header.

### **Q: What's the rate limit?**
A: 100 requests per minute per IP.

### **Q: How do I test locally?**
A: Use http://localhost:3000/api/docs or Postman.

### **Q: Where are the TypeScript types?**
A: In `/lib/sdk/client.ts` - full type safety included.

### **Q: How do I handle money values?**
A: Always use `price_minor_units` (cents). Never use floating-point for money.

### **Q: What webhook events are available?**
A: payment.succeeded, payment.failed, membership.created, membership.updated, membership.canceled, product.created, product.updated, product.deleted

### **Q: How do I verify webhook signatures?**
A: See "Webhook Security" section in API_DOCUMENTATION.md

### **Q: Can I generate SDKs in other languages?**
A: Yes! Run `./scripts/generate-sdk.sh` or use OpenAPI Generator.

### **Q: Where do I report bugs?**
A: GitHub issues or #engineering Slack.

---

## 🔗 **Resources**

| Resource | Link | Description |
|----------|------|-------------|
| **Interactive Docs** | http://localhost:3000/api/docs | Try APIs in browser |
| **OpenAPI Spec** | http://localhost:3000/api/openapi | Download YAML spec |
| **Developer Guide** | /API_DOCUMENTATION.md | Full reference guide |
| **TypeScript SDK** | /lib/sdk/README.md | SDK usage guide |
| **SDK Generator** | /scripts/generate-sdk.sh | Generate client libs |
| **Project Docs** | /CLAUDE.md | Project patterns |
| **Security Guide** | /CLAUDE.md#security | Security best practices |

---

## 🎯 **Next Steps**

1. **Share this guide** with your team
2. **Schedule a demo** - Use the script above
3. **Add to onboarding** - Include in new developer setup
4. **Create wiki page** - Use Notion/Confluence template
5. **Set up Postman workspace** - Share collections
6. **Monitor usage** - Track API metrics

---

## 📞 **Support Channels**

- **General Questions:** #engineering Slack
- **Bug Reports:** GitHub Issues
- **Feature Requests:** Product channel
- **Security Issues:** security@whopsaas.com
- **Documentation Issues:** Update and PR

---

**Last Updated:** 2025-11-28
**Version:** 1.0.0
**Maintained by:** Engineering Team
