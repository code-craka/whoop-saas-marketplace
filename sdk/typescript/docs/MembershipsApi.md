# MembershipsApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiMembershipsGet**](MembershipsApi.md#apimembershipsget) | **GET** /api/memberships | List memberships |
| [**apiMembershipsIdGet**](MembershipsApi.md#apimembershipsidget) | **GET** /api/memberships/{id} | Get membership |
| [**apiMembershipsIdPut**](MembershipsApi.md#apimembershipsidput) | **PUT** /api/memberships/{id} | Update membership |



## apiMembershipsGet

> ApiMembershipsGet200Response apiMembershipsGet(companyId, userId, productId, status, limit, offset)

List memberships

List memberships (scoped by company_id or user)

### Example

```ts
import {
  Configuration,
  MembershipsApi,
} from '@whopsaas/sdk';
import type { ApiMembershipsGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new MembershipsApi(config);

  const body = {
    // string | Filter by company (requires admin access) (optional)
    companyId: companyId_example,
    // string (optional)
    userId: userId_example,
    // string (optional)
    productId: productId_example,
    // 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing' (optional)
    status: status_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ApiMembershipsGetRequest;

  try {
    const data = await api.apiMembershipsGet(body);
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
| **companyId** | `string` | Filter by company (requires admin access) | [Optional] [Defaults to `undefined`] |
| **userId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **productId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **status** | `active`, `past_due`, `canceled`, `expired`, `trialing` |  | [Optional] [Defaults to `undefined`] [Enum: active, past_due, canceled, expired, trialing] |
| **limit** | `number` |  | [Optional] [Defaults to `50`] |
| **offset** | `number` |  | [Optional] [Defaults to `0`] |

### Return type

[**ApiMembershipsGet200Response**](ApiMembershipsGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiMembershipsIdGet

> Membership apiMembershipsIdGet(id)

Get membership

### Example

```ts
import {
  Configuration,
  MembershipsApi,
} from '@whopsaas/sdk';
import type { ApiMembershipsIdGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new MembershipsApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiMembershipsIdGetRequest;

  try {
    const data = await api.apiMembershipsIdGet(body);
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

[**Membership**](Membership.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **404** | Membership not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiMembershipsIdPut

> Membership apiMembershipsIdPut(id, membershipUpdate)

Update membership

Update membership status or metadata

### Example

```ts
import {
  Configuration,
  MembershipsApi,
} from '@whopsaas/sdk';
import type { ApiMembershipsIdPutRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new MembershipsApi(config);

  const body = {
    // string
    id: id_example,
    // MembershipUpdate
    membershipUpdate: ...,
  } satisfies ApiMembershipsIdPutRequest;

  try {
    const data = await api.apiMembershipsIdPut(body);
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
| **membershipUpdate** | [MembershipUpdate](MembershipUpdate.md) |  | |

### Return type

[**Membership**](Membership.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Membership updated |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

