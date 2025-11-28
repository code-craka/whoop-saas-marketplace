# WhopSaaS TypeScript SDK

Lightweight, type-safe TypeScript client for the WhopSaaS API.

---

## 📦 **Installation**

The SDK is included in the project. Just import and use:

```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';
```

---

## 🚀 **Quick Start**

### **Browser Usage (Client Components)**

```typescript
'use client';

import { WhopSaaSClient } from '@/lib/sdk/client';
import { useEffect, useState } from 'react';

export function ProductsList() {
  const [products, setProducts] = useState([]);
  const client = new WhopSaaSClient();

  useEffect(() => {
    async function fetchProducts() {
      const { products } = await client.products.list({
        company_id: 'biz_123',
        active: true,
      });
      setProducts(products);
    }
    fetchProducts();
  }, []);

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### **Server-Side Usage (Server Components/API Routes)**

```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';

export default async function ProductsPage() {
  const client = new WhopSaaSClient({
    baseUrl: 'http://localhost:3000',
    // Session token from cookies (if needed)
  });

  const { products } = await client.products.list({
    company_id: 'biz_123',
    active: true,
  });

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

### **Node.js/External Usage**

```typescript
import { WhopSaaSClient } from './lib/sdk/client';

const client = new WhopSaaSClient({
  baseUrl: 'https://api.whopsaas.com',
  sessionToken: 'your_session_token', // From login
});

// List products
const { products } = await client.products.list({
  company_id: 'biz_123',
});

console.log(products);
```

---

## 📚 **API Reference**

### **Products API**

```typescript
// List products
const { products, pagination } = await client.products.list({
  company_id: 'biz_123',
  active: true,
  limit: 50,
  offset: 0,
});

// Create product
const product = await client.products.create({
  company_id: 'biz_123',
  title: 'Pro Plan',
  price_amount: 49.99, // Auto-converts to cents
  plan_type: 'monthly',
  trial_days: 14,
});

// Get product
const product = await client.products.get('prod_abc123');

// Update product
const updated = await client.products.update('prod_abc123', {
  price_amount: 59.99,
  active: true,
});

// Delete product (soft delete)
const result = await client.products.delete('prod_abc123');
```

### **Companies API**

```typescript
// List companies
const { companies, pagination } = await client.companies.list({
  role: 'owner',
  type: 'sub_merchant',
  limit: 50,
});

// Create company
const company = await client.companies.create({
  title: 'My SaaS Company',
  email: 'hello@mysaas.com',
  type: 'sub_merchant',
});

// Get company
const company = await client.companies.get('biz_abc123');

// Update company
const updated = await client.companies.update('biz_abc123', {
  platform_fee_percent: 3.5,
  status: 'active',
});
```

### **Memberships API**

```typescript
// List memberships
const { memberships, pagination } = await client.memberships.list({
  company_id: 'biz_123',
  status: 'active',
  product_id: 'prod_abc',
});

// Get membership
const membership = await client.memberships.get('mem_abc123');

// Update membership (cancel)
const updated = await client.memberships.update('mem_abc123', {
  cancel_at: '2025-12-31T23:59:59Z',
});

// Update status (admin only)
const updated = await client.memberships.update('mem_abc123', {
  status: 'canceled',
});
```

### **Webhooks API**

```typescript
// List webhooks
const { webhooks, pagination } = await client.webhooks.list({
  company_id: 'biz_123',
  active: true,
});

// Create webhook
const webhook = await client.webhooks.create({
  company_id: 'biz_123',
  url: 'https://mysaas.com/webhooks',
  events: ['payment.succeeded', 'membership.created'],
});
console.log(webhook.secret); // Save this! Won't be shown again

// Get webhook
const webhook = await client.webhooks.get('whk_abc123');

// Update webhook
const updated = await client.webhooks.update('whk_abc123', {
  url: 'https://mysaas.com/webhooks/v2',
  active: true,
});

// Delete webhook
const result = await client.webhooks.delete('whk_abc123');
```

---

## 🔧 **Configuration**

### **Client Options**

```typescript
const client = new WhopSaaSClient({
  baseUrl: 'http://localhost:3000', // API base URL
  sessionToken: 'your_token', // For server-side usage
  fetch: customFetch, // Custom fetch implementation
});
```

### **Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

```typescript
const client = new WhopSaaSClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

---

## 🔐 **Authentication**

### **Browser (Automatic)**
Session token is automatically sent via cookies. No configuration needed.

### **Server-Side**
```typescript
import { getCurrentSession } from '@/lib/auth';

const session = await getCurrentSession();

const client = new WhopSaaSClient({
  sessionToken: session?.token,
});
```

### **External (Node.js)**
```typescript
// Login first
const loginResponse = await fetch('https://api.whopsaas.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const { session_token } = loginResponse.headers.get('set-cookie');

// Use token
const client = new WhopSaaSClient({
  baseUrl: 'https://api.whopsaas.com',
  sessionToken: session_token,
});
```

---

## ⚠️ **Error Handling**

```typescript
try {
  const product = await client.products.get('prod_invalid');
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Error: Product not found
  }
}
```

**Common Errors:**
- `API Error: 401` - Not authenticated
- `API Error: 403` - Insufficient permissions
- `API Error: 404` - Resource not found
- `API Error: 429` - Rate limit exceeded

---

## 💡 **Best Practices**

### **1. Reuse Client Instances**
```typescript
// ✅ Good - Create once, reuse
const client = new WhopSaaSClient();

export function useProducts() {
  return client.products.list({ company_id: 'biz_123' });
}

// ❌ Bad - Creates new client every time
function useProducts() {
  const client = new WhopSaaSClient(); // Don't do this
  return client.products.list({ company_id: 'biz_123' });
}
```

### **2. Use TypeScript Types**
```typescript
import type { Product, Company } from '@/lib/sdk/client';

function displayProduct(product: Product) {
  console.log(product.title);
}
```

### **3. Handle Pagination**
```typescript
async function getAllProducts(companyId: string) {
  const allProducts = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const { products, pagination } = await client.products.list({
      company_id: companyId,
      limit,
      offset,
    });

    allProducts.push(...products);

    if (!pagination.has_more) break;
    offset += limit;
  }

  return allProducts;
}
```

### **4. Price Handling**
```typescript
// ✅ Always use minor units for calculations
const product = await client.products.create({
  company_id: 'biz_123',
  title: 'Pro Plan',
  price_minor_units: 4999, // $49.99 in cents
  plan_type: 'monthly',
});

// Display
const displayPrice = `$${(product.price_minor_units / 100).toFixed(2)}`;
```

---

## 🧪 **Testing**

### **Mock Client**
```typescript
import { WhopSaaSClient } from '@/lib/sdk/client';

// Mock fetch
const mockFetch = jest.fn();

const client = new WhopSaaSClient({
  fetch: mockFetch as unknown as typeof fetch,
});

test('lists products', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      products: [{ id: 'prod_1', title: 'Test' }],
      pagination: { total: 1, limit: 50, offset: 0, has_more: false },
    }),
  });

  const result = await client.products.list({ company_id: 'biz_123' });
  expect(result.products).toHaveLength(1);
});
```

---

## 📖 **Full Examples**

### **Create Product Flow**
```typescript
async function createProductFlow() {
  const client = new WhopSaaSClient();

  // 1. Create company
  const company = await client.companies.create({
    title: 'My SaaS',
    email: 'hello@mysaas.com',
  });

  // 2. Create product
  const product = await client.products.create({
    company_id: company.id,
    title: 'Starter Plan',
    price_amount: 9.99,
    plan_type: 'monthly',
    trial_days: 7,
  });

  // 3. Set up webhook
  const webhook = await client.webhooks.create({
    company_id: company.id,
    url: 'https://mysaas.com/webhooks',
    events: ['payment.succeeded', 'membership.created'],
  });

  console.log('Product created:', product.id);
  console.log('Webhook secret:', webhook.secret); // Save this!
}
```

### **Dashboard Component**
```typescript
'use client';

import { WhopSaaSClient } from '@/lib/sdk/client';
import { useEffect, useState } from 'react';

export function Dashboard({ companyId }: { companyId: string }) {
  const [stats, setStats] = useState({ products: 0, members: 0 });
  const client = new WhopSaaSClient();

  useEffect(() => {
    async function loadStats() {
      const [products, memberships] = await Promise.all([
        client.products.list({ company_id: companyId }),
        client.memberships.list({ company_id: companyId, status: 'active' }),
      ]);

      setStats({
        products: products.pagination.total,
        members: memberships.pagination.total,
      });
    }
    loadStats();
  }, [companyId]);

  return (
    <div>
      <div>Products: {stats.products}</div>
      <div>Active Members: {stats.members}</div>
    </div>
  );
}
```

---

## 🔗 **Related Documentation**

- [API Documentation](../../API_DOCUMENTATION.md) - Full REST API reference
- [OpenAPI Spec](../../openapi.yaml) - Machine-readable specification
- [Swagger UI](http://localhost:3000/api/docs) - Interactive API explorer

---

**Built with TypeScript + Next.js 16**
