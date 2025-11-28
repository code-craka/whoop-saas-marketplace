# whopsaas.WebhooksApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_webhooks_get**](WebhooksApi.md#api_webhooks_get) | **GET** /api/webhooks | List webhooks
[**api_webhooks_id_delete**](WebhooksApi.md#api_webhooks_id_delete) | **DELETE** /api/webhooks/{id} | Delete webhook
[**api_webhooks_id_get**](WebhooksApi.md#api_webhooks_id_get) | **GET** /api/webhooks/{id} | Get webhook
[**api_webhooks_id_put**](WebhooksApi.md#api_webhooks_id_put) | **PUT** /api/webhooks/{id} | Update webhook
[**api_webhooks_post**](WebhooksApi.md#api_webhooks_post) | **POST** /api/webhooks | Create webhook


# **api_webhooks_get**
> ApiWebhooksGet200Response api_webhooks_get(company_id, active=active, limit=limit, offset=offset)

List webhooks

List webhook subscriptions (admins only)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_webhooks_get200_response import ApiWebhooksGet200Response
from whopsaas.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = whopsaas.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with whopsaas.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = whopsaas.WebhooksApi(api_client)
    company_id = 'company_id_example' # str | 
    active = True # bool |  (optional)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # List webhooks
        api_response = api_instance.api_webhooks_get(company_id, active=active, limit=limit, offset=offset)
        print("The response of WebhooksApi->api_webhooks_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WebhooksApi->api_webhooks_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **company_id** | **str**|  | 
 **active** | **bool**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**ApiWebhooksGet200Response**](ApiWebhooksGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**403** | Forbidden (admins only) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_webhooks_id_delete**
> ApiWebhooksIdDelete200Response api_webhooks_id_delete(id)

Delete webhook

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_webhooks_id_delete200_response import ApiWebhooksIdDelete200Response
from whopsaas.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = whopsaas.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with whopsaas.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = whopsaas.WebhooksApi(api_client)
    id = 'id_example' # str | 

    try:
        # Delete webhook
        api_response = api_instance.api_webhooks_id_delete(id)
        print("The response of WebhooksApi->api_webhooks_id_delete:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WebhooksApi->api_webhooks_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**ApiWebhooksIdDelete200Response**](ApiWebhooksIdDelete200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Webhook deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_webhooks_id_get**
> Webhook api_webhooks_id_get(id)

Get webhook

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.webhook import Webhook
from whopsaas.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = whopsaas.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with whopsaas.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = whopsaas.WebhooksApi(api_client)
    id = 'id_example' # str | 

    try:
        # Get webhook
        api_response = api_instance.api_webhooks_id_get(id)
        print("The response of WebhooksApi->api_webhooks_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WebhooksApi->api_webhooks_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**Webhook**](Webhook.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_webhooks_id_put**
> Webhook api_webhooks_id_put(id, webhook_update)

Update webhook

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.webhook import Webhook
from whopsaas.models.webhook_update import WebhookUpdate
from whopsaas.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = whopsaas.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with whopsaas.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = whopsaas.WebhooksApi(api_client)
    id = 'id_example' # str | 
    webhook_update = whopsaas.WebhookUpdate() # WebhookUpdate | 

    try:
        # Update webhook
        api_response = api_instance.api_webhooks_id_put(id, webhook_update)
        print("The response of WebhooksApi->api_webhooks_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WebhooksApi->api_webhooks_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **webhook_update** | [**WebhookUpdate**](WebhookUpdate.md)|  | 

### Return type

[**Webhook**](Webhook.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Webhook updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_webhooks_post**
> ApiWebhooksPost201Response api_webhooks_post(webhook_create)

Create webhook

Create webhook subscription (admins only). Returns full secret only on creation.

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_webhooks_post201_response import ApiWebhooksPost201Response
from whopsaas.models.webhook_create import WebhookCreate
from whopsaas.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = whopsaas.Configuration(
    host = "http://localhost:3000"
)

# The client must configure the authentication and authorization parameters
# in accordance with the API server security policy.
# Examples for each auth method are provided below, use the example that
# satisfies your auth use case.

# Configure API key authorization: cookieAuth
configuration.api_key['cookieAuth'] = os.environ["API_KEY"]

# Uncomment below to setup prefix (e.g. Bearer) for API key, if needed
# configuration.api_key_prefix['cookieAuth'] = 'Bearer'

# Enter a context with an instance of the API client
with whopsaas.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = whopsaas.WebhooksApi(api_client)
    webhook_create = whopsaas.WebhookCreate() # WebhookCreate | 

    try:
        # Create webhook
        api_response = api_instance.api_webhooks_post(webhook_create)
        print("The response of WebhooksApi->api_webhooks_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling WebhooksApi->api_webhooks_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **webhook_create** | [**WebhookCreate**](WebhookCreate.md)|  | 

### Return type

[**ApiWebhooksPost201Response**](ApiWebhooksPost201Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Webhook created |  -  |
**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

