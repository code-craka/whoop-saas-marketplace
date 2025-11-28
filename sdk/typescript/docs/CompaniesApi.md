# CompaniesApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiCompaniesGet**](CompaniesApi.md#apicompaniesget) | **GET** /api/companies | List companies |
| [**apiCompaniesIdGet**](CompaniesApi.md#apicompaniesidget) | **GET** /api/companies/{id} | Get company |
| [**apiCompaniesIdPut**](CompaniesApi.md#apicompaniesidput) | **PUT** /api/companies/{id} | Update company |
| [**apiCompaniesPost**](CompaniesApi.md#apicompaniespost) | **POST** /api/companies | Create company |



## apiCompaniesGet

> ApiCompaniesGet200Response apiCompaniesGet(role, type, limit, offset)

List companies

List all companies user has access to

### Example

```ts
import {
  Configuration,
  CompaniesApi,
} from '@whopsaas/sdk';
import type { ApiCompaniesGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CompaniesApi(config);

  const body = {
    // 'owner' | 'admin' | 'member' (optional)
    role: role_example,
    // 'platform' | 'sub_merchant' (optional)
    type: type_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ApiCompaniesGetRequest;

  try {
    const data = await api.apiCompaniesGet(body);
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
| **role** | `owner`, `admin`, `member` |  | [Optional] [Defaults to `undefined`] [Enum: owner, admin, member] |
| **type** | `platform`, `sub_merchant` |  | [Optional] [Defaults to `undefined`] [Enum: platform, sub_merchant] |
| **limit** | `number` |  | [Optional] [Defaults to `50`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**ApiCompaniesGet200Response**](ApiCompaniesGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiCompaniesIdGet

> ApiCompaniesIdGet200Response apiCompaniesIdGet(id)

Get company

### Example

```ts
import {
  Configuration,
  CompaniesApi,
} from '@whopsaas/sdk';
import type { ApiCompaniesIdGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CompaniesApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiCompaniesIdGetRequest;

  try {
    const data = await api.apiCompaniesIdGet(body);
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

[**ApiCompaniesIdGet200Response**](ApiCompaniesIdGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **404** | Company not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiCompaniesIdPut

> Company apiCompaniesIdPut(id, companyUpdate)

Update company

Update company (requires admin/owner role)

### Example

```ts
import {
  Configuration,
  CompaniesApi,
} from '@whopsaas/sdk';
import type { ApiCompaniesIdPutRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CompaniesApi(config);

  const body = {
    // string
    id: id_example,
    // CompanyUpdate
    companyUpdate: ...,
  } satisfies ApiCompaniesIdPutRequest;

  try {
    const data = await api.apiCompaniesIdPut(body);
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
| **companyUpdate** | [CompanyUpdate](CompanyUpdate.md) |  | |

### Return type

[**Company**](Company.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Company updated |  -  |
| **403** | Forbidden |  -  |
| **409** | Conflict (email already exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiCompaniesPost

> Company apiCompaniesPost(companyCreate)

Create company

Create a new company (user becomes owner)

### Example

```ts
import {
  Configuration,
  CompaniesApi,
} from '@whopsaas/sdk';
import type { ApiCompaniesPostRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new CompaniesApi(config);

  const body = {
    // CompanyCreate
    companyCreate: ...,
  } satisfies ApiCompaniesPostRequest;

  try {
    const data = await api.apiCompaniesPost(body);
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
| **companyCreate** | [CompanyCreate](CompanyCreate.md) |  | |

### Return type

[**Company**](Company.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Company created |  -  |
| **409** | Conflict (email already exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

