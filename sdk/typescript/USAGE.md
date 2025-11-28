# WhopSaaS TypeScript SDK

## Installation

```bash
pnpm add @whopsaas/sdk
# or
npm install @whopsaas/sdk
```

## Usage

```typescript
import { Configuration, ProductsApi } from '@whopsaas/sdk';

// Configure API client
const config = new Configuration({
  basePath: 'http://localhost:3000',
  credentials: 'include', // Include cookies for auth
});

const productsApi = new ProductsApi(config);

// List products
const products = await productsApi.apiProductsGet({
  companyId: 'biz_123',
  active: true,
  limit: 10,
});

console.log(products.products);
```

## Authentication

The SDK uses cookie-based authentication. Ensure you're logged in via the web app
or set the session token cookie manually.

## API Reference

See [API Documentation](../../API_DOCUMENTATION.md) for full reference.
