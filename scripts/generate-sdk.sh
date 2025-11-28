#!/bin/bash

# SDK Generation Script
# Generates TypeScript and Python SDKs from OpenAPI specification

set -e

echo "🔧 Generating SDKs from OpenAPI specification..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create SDK directory
mkdir -p sdk

# Generate TypeScript SDK
echo -e "${BLUE}📦 Generating TypeScript SDK...${NC}"
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o sdk/typescript \
  --additional-properties=npmName=@whopsaas/sdk,npmVersion=1.0.0,supportsES6=true

echo -e "${GREEN}✅ TypeScript SDK generated at sdk/typescript${NC}"

# Generate Python SDK
echo -e "${BLUE}🐍 Generating Python SDK...${NC}"
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o sdk/python \
  --additional-properties=packageName=whopsaas,projectName=whopsaas-sdk,packageVersion=1.0.0

echo -e "${GREEN}✅ Python SDK generated at sdk/python${NC}"

# Generate Go SDK (optional)
# echo -e "${BLUE}🔵 Generating Go SDK...${NC}"
# npx @openapitools/openapi-generator-cli generate \
#   -i openapi.yaml \
#   -g go \
#   -o sdk/go \
#   --additional-properties=packageName=whopsaas

# Create README for each SDK
cat > sdk/typescript/USAGE.md << 'EOF'
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
EOF

cat > sdk/python/USAGE.md << 'EOF'
# WhopSaaS Python SDK

## Installation

```bash
pip install whopsaas-sdk
```

## Usage

```python
from whopsaas import ApiClient, Configuration, ProductsApi

# Configure API client
config = Configuration(
    host="http://localhost:3000"
)

# Create API client
client = ApiClient(config)
products_api = ProductsApi(client)

# List products
products = products_api.api_products_get(
    company_id="biz_123",
    active=True,
    limit=10
)

print(products.products)
```

## Authentication

Set the `session_token` cookie in requests for authentication.

## API Reference

See [API Documentation](../../API_DOCUMENTATION.md) for full reference.
EOF

echo ""
echo -e "${GREEN}✅ SDK generation complete!${NC}"
echo ""
echo "📦 Generated SDKs:"
echo "  - TypeScript: sdk/typescript"
echo "  - Python: sdk/python"
echo ""
echo "📚 Next steps:"
echo "  1. Review generated code in sdk/ directory"
echo "  2. Test SDKs with your API"
echo "  3. Publish to npm/PyPI (optional)"
echo ""
