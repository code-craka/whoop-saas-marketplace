# whopsaas.ProductsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_products_get**](ProductsApi.md#api_products_get) | **GET** /api/products | List products
[**api_products_id_delete**](ProductsApi.md#api_products_id_delete) | **DELETE** /api/products/{id} | Delete product
[**api_products_id_get**](ProductsApi.md#api_products_id_get) | **GET** /api/products/{id} | Get product
[**api_products_id_put**](ProductsApi.md#api_products_id_put) | **PUT** /api/products/{id} | Update product
[**api_products_post**](ProductsApi.md#api_products_post) | **POST** /api/products | Create product


# **api_products_get**
> ApiProductsGet200Response api_products_get(company_id, active=active, limit=limit, offset=offset)

List products

List all products for a company with pagination

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_products_get200_response import ApiProductsGet200Response
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
    api_instance = whopsaas.ProductsApi(api_client)
    company_id = 'company_id_example' # str | 
    active = True # bool |  (optional)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # List products
        api_response = api_instance.api_products_get(company_id, active=active, limit=limit, offset=offset)
        print("The response of ProductsApi->api_products_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProductsApi->api_products_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **company_id** | **str**|  | 
 **active** | **bool**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**ApiProductsGet200Response**](ApiProductsGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**400** | Bad request (missing company_id) |  -  |
**403** | Forbidden (no access to company) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_products_id_delete**
> ApiProductsIdDelete200Response api_products_id_delete(id)

Delete product

Soft delete (sets active=false). Only owners can delete. Prevents deletion if active memberships exist.

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_products_id_delete200_response import ApiProductsIdDelete200Response
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
    api_instance = whopsaas.ProductsApi(api_client)
    id = 'id_example' # str | 

    try:
        # Delete product
        api_response = api_instance.api_products_id_delete(id)
        print("The response of ProductsApi->api_products_id_delete:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProductsApi->api_products_id_delete: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**ApiProductsIdDelete200Response**](ApiProductsIdDelete200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Product deleted |  -  |
**400** | Cannot delete (active memberships exist) |  -  |
**403** | Forbidden (only owners can delete) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_products_id_get**
> Product api_products_id_get(id)

Get product

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.product import Product
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
    api_instance = whopsaas.ProductsApi(api_client)
    id = 'id_example' # str | 

    try:
        # Get product
        api_response = api_instance.api_products_id_get(id)
        print("The response of ProductsApi->api_products_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProductsApi->api_products_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**404** | Product not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_products_id_put**
> Product api_products_id_put(id, product_update)

Update product

Update product (requires admin/owner role)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.product import Product
from whopsaas.models.product_update import ProductUpdate
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
    api_instance = whopsaas.ProductsApi(api_client)
    id = 'id_example' # str | 
    product_update = whopsaas.ProductUpdate() # ProductUpdate | 

    try:
        # Update product
        api_response = api_instance.api_products_id_put(id, product_update)
        print("The response of ProductsApi->api_products_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProductsApi->api_products_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **product_update** | [**ProductUpdate**](ProductUpdate.md)|  | 

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Product updated |  -  |
**400** | Validation error |  -  |
**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_products_post**
> Product api_products_post(product_create)

Create product

Create a new product (requires admin/owner role)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.product import Product
from whopsaas.models.product_create import ProductCreate
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
    api_instance = whopsaas.ProductsApi(api_client)
    product_create = whopsaas.ProductCreate() # ProductCreate | 

    try:
        # Create product
        api_response = api_instance.api_products_post(product_create)
        print("The response of ProductsApi->api_products_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling ProductsApi->api_products_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **product_create** | [**ProductCreate**](ProductCreate.md)|  | 

### Return type

[**Product**](Product.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Product created |  -  |
**400** | Validation error |  -  |
**403** | Forbidden (insufficient permissions) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

