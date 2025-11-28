# WebhooksApi

All URIs are relative to *http://localhost:3000*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiWebhooksGet**](WebhooksApi.md#apiwebhooksget) | **GET** /api/webhooks | List webhooks |
| [**apiWebhooksIdDelete**](WebhooksApi.md#apiwebhooksiddelete) | **DELETE** /api/webhooks/{id} | Delete webhook |
| [**apiWebhooksIdGet**](WebhooksApi.md#apiwebhooksidget) | **GET** /api/webhooks/{id} | Get webhook |
| [**apiWebhooksIdPut**](WebhooksApi.md#apiwebhooksidput) | **PUT** /api/webhooks/{id} | Update webhook |
| [**apiWebhooksPost**](WebhooksApi.md#apiwebhookspost) | **POST** /api/webhooks | Create webhook |



## apiWebhooksGet

> ApiWebhooksGet200Response apiWebhooksGet(companyId, active, limit, offset)

List webhooks

List webhook subscriptions (admins only)

### Example

```ts
import {
  Configuration,
  WebhooksApi,
} from '@whopsaas/sdk';
import type { ApiWebhooksGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WebhooksApi(config);

  const body = {
    // string
    companyId: companyId_example,
    // boolean (optional)
    active: true,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
  } satisfies ApiWebhooksGetRequest;

  try {
    const data = await api.apiWebhooksGet(body);
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

[**ApiWebhooksGet200Response**](ApiWebhooksGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Success |  -  |
| **403** | Forbidden (admins only) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiWebhooksIdDelete

> ApiWebhooksIdDelete200Response apiWebhooksIdDelete(id)

Delete webhook

### Example

```ts
import {
  Configuration,
  WebhooksApi,
} from '@whopsaas/sdk';
import type { ApiWebhooksIdDeleteRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WebhooksApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiWebhooksIdDeleteRequest;

  try {
    const data = await api.apiWebhooksIdDelete(body);
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

[**ApiWebhooksIdDelete200Response**](ApiWebhooksIdDelete200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiWebhooksIdGet

> Webhook apiWebhooksIdGet(id)

Get webhook

### Example

```ts
import {
  Configuration,
  WebhooksApi,
} from '@whopsaas/sdk';
import type { ApiWebhooksIdGetRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WebhooksApi(config);

  const body = {
    // string
    id: id_example,
  } satisfies ApiWebhooksIdGetRequest;

  try {
    const data = await api.apiWebhooksIdGet(body);
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

[**Webhook**](Webhook.md)

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


## apiWebhooksIdPut

> Webhook apiWebhooksIdPut(id, webhookUpdate)

Update webhook

### Example

```ts
import {
  Configuration,
  WebhooksApi,
} from '@whopsaas/sdk';
import type { ApiWebhooksIdPutRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WebhooksApi(config);

  const body = {
    // string
    id: id_example,
    // WebhookUpdate
    webhookUpdate: ...,
  } satisfies ApiWebhooksIdPutRequest;

  try {
    const data = await api.apiWebhooksIdPut(body);
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
| **webhookUpdate** | [WebhookUpdate](WebhookUpdate.md) |  | |

### Return type

[**Webhook**](Webhook.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Webhook updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiWebhooksPost

> ApiWebhooksPost201Response apiWebhooksPost(webhookCreate)

Create webhook

Create webhook subscription (admins only). Returns full secret only on creation.

### Example

```ts
import {
  Configuration,
  WebhooksApi,
} from '@whopsaas/sdk';
import type { ApiWebhooksPostRequest } from '@whopsaas/sdk';

async function example() {
  console.log("🚀 Testing @whopsaas/sdk SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: cookieAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WebhooksApi(config);

  const body = {
    // WebhookCreate
    webhookCreate: ...,
  } satisfies ApiWebhooksPostRequest;

  try {
    const data = await api.apiWebhooksPost(body);
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
| **webhookCreate** | [WebhookCreate](WebhookCreate.md) |  | |

### Return type

[**ApiWebhooksPost201Response**](ApiWebhooksPost201Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Webhook created |  -  |
| **403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

