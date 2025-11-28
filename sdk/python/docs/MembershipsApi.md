# whopsaas.MembershipsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_memberships_get**](MembershipsApi.md#api_memberships_get) | **GET** /api/memberships | List memberships
[**api_memberships_id_get**](MembershipsApi.md#api_memberships_id_get) | **GET** /api/memberships/{id} | Get membership
[**api_memberships_id_put**](MembershipsApi.md#api_memberships_id_put) | **PUT** /api/memberships/{id} | Update membership


# **api_memberships_get**
> ApiMembershipsGet200Response api_memberships_get(company_id=company_id, user_id=user_id, product_id=product_id, status=status, limit=limit, offset=offset)

List memberships

List memberships (scoped by company_id or user)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_memberships_get200_response import ApiMembershipsGet200Response
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
    api_instance = whopsaas.MembershipsApi(api_client)
    company_id = 'company_id_example' # str | Filter by company (requires admin access) (optional)
    user_id = 'user_id_example' # str |  (optional)
    product_id = 'product_id_example' # str |  (optional)
    status = 'status_example' # str |  (optional)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # List memberships
        api_response = api_instance.api_memberships_get(company_id=company_id, user_id=user_id, product_id=product_id, status=status, limit=limit, offset=offset)
        print("The response of MembershipsApi->api_memberships_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MembershipsApi->api_memberships_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **company_id** | **str**| Filter by company (requires admin access) | [optional] 
 **user_id** | **str**|  | [optional] 
 **product_id** | **str**|  | [optional] 
 **status** | **str**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**ApiMembershipsGet200Response**](ApiMembershipsGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_memberships_id_get**
> Membership api_memberships_id_get(id)

Get membership

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.membership import Membership
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
    api_instance = whopsaas.MembershipsApi(api_client)
    id = 'id_example' # str | 

    try:
        # Get membership
        api_response = api_instance.api_memberships_id_get(id)
        print("The response of MembershipsApi->api_memberships_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MembershipsApi->api_memberships_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**Membership**](Membership.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**404** | Membership not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_memberships_id_put**
> Membership api_memberships_id_put(id, membership_update)

Update membership

Update membership status or metadata

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.membership import Membership
from whopsaas.models.membership_update import MembershipUpdate
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
    api_instance = whopsaas.MembershipsApi(api_client)
    id = 'id_example' # str | 
    membership_update = whopsaas.MembershipUpdate() # MembershipUpdate | 

    try:
        # Update membership
        api_response = api_instance.api_memberships_id_put(id, membership_update)
        print("The response of MembershipsApi->api_memberships_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling MembershipsApi->api_memberships_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **membership_update** | [**MembershipUpdate**](MembershipUpdate.md)|  | 

### Return type

[**Membership**](Membership.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Membership updated |  -  |
**403** | Forbidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

