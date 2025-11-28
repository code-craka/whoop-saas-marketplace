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
