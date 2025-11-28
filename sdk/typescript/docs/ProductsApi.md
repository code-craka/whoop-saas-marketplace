# ProductsApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiProductsGet**](ProductsApi.md#apiproductsget) | **GET** /api/products | List products |
| [**apiProductsIdDelete**](ProductsApi.md#apiproductsiddelete) | **DELETE** /api/products/{id} | Delete product |
| [**apiProductsIdGet**](ProductsApi.md#apiproductsidget) | **GET** /api/products/{id} | Get product |
| [**apiProductsIdPut**](ProductsApi.md#apiproductsidput) | **PUT** /api/products/{id} | Update product |
| [**apiProductsPost**](ProductsApi.md#apiproductspost) | **POST** /api/products | Create product |



## apiProductsGet

> ApiProductsGet200Response apiProductsGet(companyId, active, limit, offset)

List products

List all products for a company with pagination

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '@whopsaas/sdk';
import type { ApiProductsGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ProductsApi(config);

  const body = {
    // string
    companyId: companyId_example,
    // boolean (optional)
    active: true,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ApiProductsGetRequest;

  try {
    const data = await api.apiProductsGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **companyId** | `string` |  | [Defaults to `undefined`] |
| **active** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `50`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**ApiProductsGet200Response**](ApiProductsGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **400** | Bad request (missing company_id) |  -  |
| **403** | Forbidden (no access to company) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsIdDelete

> ApiProductsIdDelete200Response apiProductsIdDelete(id)

Delete product

Soft delete (sets active&#x3D;false). Only owners can delete. Prevents deletion if active memberships exist.

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '@whopsaas/sdk';
import type { ApiProductsIdDeleteRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ProductsApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiProductsIdDeleteRequest;

  try {
    const data = await api.apiProductsIdDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ApiProductsIdDelete200Response**](ApiProductsIdDelete200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Product deleted |  -  |
| **400** | Cannot delete (active memberships exist) |  -  |
| **403** | Forbidden (only owners can delete) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsIdGet

> Product apiProductsIdGet(id)

Get product

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '@whopsaas/sdk';
import type { ApiProductsIdGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ProductsApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiProductsIdGetRequest;

  try {
    const data = await api.apiProductsIdGet(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **404** | Product not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsIdPut

> Product apiProductsIdPut(id, productUpdate)

Update product

Update product (requires admin/owner role)

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '@whopsaas/sdk';
import type { ApiProductsIdPutRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ProductsApi(config);

  const body = {
    // string
    id: id_example,
    // ProductUpdate
    productUpdate: ...,
  } satisfies ApiProductsIdPutRequest;

  try {
    const data = await api.apiProductsIdPut(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **productUpdate** | [ProductUpdate](ProductUpdate.md) |  | |

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Product updated |  -  |
| **400** | Validation error |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsPost

> Product apiProductsPost(productCreate)

Create product

Create a new product (requires admin/owner role)

### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '@whopsaas/sdk';
import type { ApiProductsPostRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ProductsApi(config);

  const body = {
    // ProductCreate
    productCreate: ...,
  } satisfies ApiProductsPostRequest;

  try {
    const data = await api.apiProductsPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **productCreate** | [ProductCreate](ProductCreate.md) |  | |

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Product created |  -  |
| **400** | Validation error |  -  |
| **403** | Forbidden (insufficient permissions) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

