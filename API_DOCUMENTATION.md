# Whop SaaS Marketplace API Documentation

Complete REST API documentation for the Whop SaaS Marketplace platform.

---

## 📚 **Accessing the Documentation**

### **Interactive Swagger UI**
```bash
# Start the development server
pnpm dev

# Visit in your browser
http://localhost:3000/api/docs
```

The Swagger UI provides:
- ✅ Interactive API explorer
- ✅ Try-it-out functionality
- ✅ Request/response examples
- ✅ Schema definitions
- ✅ Authentication testing

### **OpenAPI Specification**
```bash
# Raw YAML specification
http://localhost:3000/api/openapi

# Download the spec
curl http://localhost:3000/api/openapi > openapi.yaml
```

---

## 🔐 **Authentication**

All API endpoints require authentication via session token cookie.

### **Authentication Flow**
1. Login via `/login` page or POST to `/api/auth/login`
2. Receive `session_token` HTTP-only cookie
3. Cookie automatically sent with subsequent requests
4. Token expires after 7 days

### **Example: Authenticated Request**
```bash
curl -X GET http://localhost:3000/api/products?company_id=biz_123 \
  -H "Cookie: session_token=your_token_here"
```

---

## 🏢 **Multi-Tenancy**

All resources are scoped to companies (tenants).

### **Company Roles**
- **Owner**: Full access (create, update, delete, manage users)
- **Admin**: Most operations (cannot delete resources or change company status)
- **Member**: Read-only access to own data

### **Tenant Isolation**
- All queries automatically filtered by `company_id`
- Cross-tenant data access is prevented
- Users can belong to multiple companies with different roles

---

## 💰 **Money Handling**

**CRITICAL**: All monetary values use **minor units (cents)** to avoid floating-point errors.

### **Example**
```json
{
  "price_amount": 49.99,        // Display value (dollars)
  "price_minor_units": 4999,    // Storage value (cents) ✅
  "currency": "USD"
}
```

When creating/updating products:
- Provide **EITHER** `price_amount` (dollars) **OR** `price_minor_units` (cents)
- API auto-converts `price_amount` → `price_minor_units`
- Always use `price_minor_units` for calculations

---

## 📋 **API Endpoints Overview**

### **Products API**
Manage subscription plans and one-time products.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/products?company_id={id}` | List products | Member |
| POST | `/api/products` | Create product | Admin/Owner |
| GET | `/api/products/{id}` | Get product | Member |
| PUT | `/api/products/{id}` | Update product | Admin/Owner |
| DELETE | `/api/products/{id}` | Delete product | Owner |

### **Companies API**
Manage company tenants and sub-merchants.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/companies` | List user's companies | Authenticated |
| POST | `/api/companies` | Create company | Authenticated |
| GET | `/api/companies/{id}` | Get company | Member |
| PUT | `/api/companies/{id}` | Update company | Admin/Owner |

### **Memberships API**
View and manage user subscriptions.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/memberships?company_id={id}` | List memberships | Admin (or own) |
| GET | `/api/memberships/{id}` | Get membership | Owner (or admin) |
| PUT | `/api/memberships/{id}` | Update/cancel membership | Owner (or admin) |

**Note:** Memberships are created via the checkout flow, not directly via API.

### **Webhooks API**
Subscribe to platform events for real-time notifications.

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/webhooks?company_id={id}` | List webhooks | Admin/Owner |
| POST | `/api/webhooks` | Create webhook | Admin/Owner |
| GET | `/api/webhooks/{id}` | Get webhook | Admin/Owner |
| PUT | `/api/webhooks/{id}` | Update webhook | Admin/Owner |
| DELETE | `/api/webhooks/{id}` | Delete webhook | Admin/Owner |

---

## 📡 **Webhook Events**

Subscribe to these events:

### **Payment Events**
- `payment.succeeded` - Payment completed successfully
- `payment.failed` - Payment failed

### **Membership Events**
- `membership.created` - New subscription created
- `membership.updated` - Subscription status changed
- `membership.canceled` - Subscription canceled

### **Product Events**
- `product.created` - New product created
- `product.updated` - Product modified
- `product.deleted` - Product deleted (soft delete)

### **Webhook Payload**
```json
{
  "event_type": "payment.succeeded",
  "event_id": "evt_abc123",
  "data": {
    "payment_id": "pay_xyz789",
    "amount": 4999,
    "currency": "USD",
    "company_id": "biz_123"
  },
  "timestamp": "2025-11-28T12:00:00Z"
}
```

### **Webhook Security**
All webhooks include HMAC-SHA256 signature:
```http
X-Webhook-Signature: sha256=abc123...
```

Verify using your webhook secret:
```typescript
import { createHmac } from 'crypto';

const signature = createHmac('sha256', webhookSecret)
  .update(requestBody)
  .digest('hex');

if (signature !== receivedSignature) {
  throw new Error('Invalid signature');
}
```

---

## 🔍 **Common Patterns**

### **Pagination**
All list endpoints support pagination:
```bash
GET /api/products?company_id=biz_123&limit=50&offset=0
```

Response includes pagination metadata:
```json
{
  "products": [...],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### **Filtering**
Filter by status, type, or other fields:
```bash
# Active products only
GET /api/products?company_id=biz_123&active=true

# Canceled memberships
GET /api/memberships?company_id=biz_123&status=canceled

# Owner companies only
GET /api/companies?role=owner
```

### **Error Handling**
All errors follow this format:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "price_amount",
      "message": "Must be a positive number"
    }
  ]
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## 🚀 **Quick Start Examples**

### **Create a Product**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_token" \
  -d '{
    "company_id": "biz_123",
    "title": "Pro Plan",
    "description": "Premium features",
    "price_amount": 49.99,
    "plan_type": "monthly",
    "trial_days": 14
  }'
```

### **Create a Company**
```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_token" \
  -d '{
    "title": "My SaaS Company",
    "email": "hello@mysaas.com",
    "type": "sub_merchant"
  }'
```

### **Create a Webhook**
```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_token" \
  -d '{
    "company_id": "biz_123",
    "url": "https://mysaas.com/webhooks",
    "events": ["payment.succeeded", "membership.created"]
  }'
```

### **List Products**
```bash
curl -X GET "http://localhost:3000/api/products?company_id=biz_123&active=true&limit=10" \
  -H "Cookie: session_token=your_token"
```

### **Update a Product**
```bash
curl -X PUT http://localhost:3000/api/products/prod_abc123 \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_token" \
  -d '{
    "price_amount": 59.99,
    "active": true
  }'
```

### **Cancel a Membership**
```bash
curl -X PUT http://localhost:3000/api/memberships/mem_abc123 \
  -H "Content-Type: application/json" \
  -H "Cookie: session_token=your_token" \
  -d '{
    "cancel_at": "2025-12-31T23:59:59Z"
  }'
```

---

## 🧪 **Testing with Postman**

### **Import OpenAPI Spec**
1. Download the spec: `http://localhost:3000/api/openapi`
2. Open Postman
3. Import → Upload Files → Select `openapi.yaml`
4. All endpoints automatically imported!

### **Set Up Environment**
Create a Postman environment with:
```
base_url: http://localhost:3000
session_token: your_token_here
company_id: biz_123
```

Use variables in requests:
```
{{base_url}}/api/products?company_id={{company_id}}
```

---

## 📊 **Rate Limiting**

- **Limit**: 100 requests per minute per IP
- **Response**: `429 Too Many Requests`
- **Header**: `Retry-After: 60` (seconds)

**Tip**: Implement exponential backoff when hitting rate limits.

---

## 🔒 **Security Best Practices**

### **For API Consumers**
- ✅ Never log or expose `session_token`
- ✅ Always validate webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement retry logic with exponential backoff
- ✅ Store webhook secrets securely (env variables)

### **For API Developers**
- ✅ Never expose sensitive fields (passwords, full secrets)
- ✅ Always use tenant isolation (`runInTenantContext`)
- ✅ Validate all inputs with Zod schemas
- ✅ Check permissions before operations
- ✅ Use minor units for money calculations

---

## 📦 **SDKs & Client Libraries**

### **TypeScript/JavaScript SDK** (Coming Soon)
```typescript
import { WhopSaaS } from '@whopsaas/sdk';

const client = new WhopSaaS({
  sessionToken: 'your_token',
});

const products = await client.products.list({ companyId: 'biz_123' });
```

### **OpenAPI Code Generation**
Generate clients in any language:
```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./sdk/typescript

# Generate Python client
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./sdk/python
```

---

## 🐛 **Troubleshooting**

### **401 Unauthorized**
- Check if you're logged in
- Verify `session_token` cookie is present
- Token may have expired (7-day TTL)

### **403 Forbidden**
- Check your role (owner/admin/member)
- Some operations require admin/owner permissions
- Verify you have access to the company

### **400 Bad Request**
- Check request body matches schema
- Validate required fields are provided
- Ensure types are correct (string, number, etc.)

### **404 Not Found**
- Verify resource ID is correct
- Check if resource exists
- Ensure you have access to the company

---

## 📞 **Support**

- **API Documentation**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI Spec**: [http://localhost:3000/api/openapi](http://localhost:3000/api/openapi)
- **Issues**: Report at GitHub repository
- **Email**: api@whopsaas.com

---

## 📝 **Changelog**

### **v1.0.0** (2025-11-28)
- ✅ Products API (full CRUD)
- ✅ Companies API (list, create, update)
- ✅ Memberships API (list, get, update)
- ✅ Webhooks API (full CRUD)
- ✅ OpenAPI 3.0 specification
- ✅ Swagger UI interactive docs
- ✅ Multi-tenant isolation
- ✅ Role-based access control
- ✅ Rate limiting (100 req/min)

---

**Built with ❤️ using Next.js 16, Prisma 7, and TypeScript**
