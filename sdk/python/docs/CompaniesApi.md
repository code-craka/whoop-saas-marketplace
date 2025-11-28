# whopsaas.CompaniesApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_companies_get**](CompaniesApi.md#api_companies_get) | **GET** /api/companies | List companies
[**api_companies_id_get**](CompaniesApi.md#api_companies_id_get) | **GET** /api/companies/{id} | Get company
[**api_companies_id_put**](CompaniesApi.md#api_companies_id_put) | **PUT** /api/companies/{id} | Update company
[**api_companies_post**](CompaniesApi.md#api_companies_post) | **POST** /api/companies | Create company


# **api_companies_get**
> ApiCompaniesGet200Response api_companies_get(role=role, type=type, limit=limit, offset=offset)

List companies

List all companies user has access to

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_companies_get200_response import ApiCompaniesGet200Response
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
    api_instance = whopsaas.CompaniesApi(api_client)
    role = 'role_example' # str |  (optional)
    type = 'type_example' # str |  (optional)
    limit = 50 # int |  (optional) (default to 50)
    offset = 0 # int |  (optional) (default to 0)

    try:
        # List companies
        api_response = api_instance.api_companies_get(role=role, type=type, limit=limit, offset=offset)
        print("The response of CompaniesApi->api_companies_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CompaniesApi->api_companies_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **role** | **str**|  | [optional] 
 **type** | **str**|  | [optional] 
 **limit** | **int**|  | [optional] [default to 50]
 **offset** | **int**|  | [optional] [default to 0]

### Return type

[**ApiCompaniesGet200Response**](ApiCompaniesGet200Response.md)

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

# **api_companies_id_get**
> ApiCompaniesIdGet200Response api_companies_id_get(id)

Get company

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.api_companies_id_get200_response import ApiCompaniesIdGet200Response
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
    api_instance = whopsaas.CompaniesApi(api_client)
    id = 'id_example' # str | 

    try:
        # Get company
        api_response = api_instance.api_companies_id_get(id)
        print("The response of CompaniesApi->api_companies_id_get:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CompaniesApi->api_companies_id_get: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 

### Return type

[**ApiCompaniesIdGet200Response**](ApiCompaniesIdGet200Response.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Success |  -  |
**404** | Company not found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_companies_id_put**
> Company api_companies_id_put(id, company_update)

Update company

Update company (requires admin/owner role)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.company import Company
from whopsaas.models.company_update import CompanyUpdate
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
    api_instance = whopsaas.CompaniesApi(api_client)
    id = 'id_example' # str | 
    company_update = whopsaas.CompanyUpdate() # CompanyUpdate | 

    try:
        # Update company
        api_response = api_instance.api_companies_id_put(id, company_update)
        print("The response of CompaniesApi->api_companies_id_put:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CompaniesApi->api_companies_id_put: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **str**|  | 
 **company_update** | [**CompanyUpdate**](CompanyUpdate.md)|  | 

### Return type

[**Company**](Company.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**200** | Company updated |  -  |
**403** | Forbidden |  -  |
**409** | Conflict (email already exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **api_companies_post**
> Company api_companies_post(company_create)

Create company

Create a new company (user becomes owner)

### Example

* Api Key Authentication (cookieAuth):

```python
import whopsaas
from whopsaas.models.company import Company
from whopsaas.models.company_create import CompanyCreate
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
    api_instance = whopsaas.CompaniesApi(api_client)
    company_create = whopsaas.CompanyCreate() # CompanyCreate | 

    try:
        # Create company
        api_response = api_instance.api_companies_post(company_create)
        print("The response of CompaniesApi->api_companies_post:\n")
        pprint(api_response)
    except Exception as e:
        print("Exception when calling CompaniesApi->api_companies_post: %s\n" % e)
```



### Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **company_create** | [**CompanyCreate**](CompanyCreate.md)|  | 

### Return type

[**Company**](Company.md)

### Authorization

[cookieAuth](../README.md#cookieAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

### HTTP response details

| Status code | Description | Response headers |
|-------------|-------------|------------------|
**201** | Company created |  -  |
**409** | Conflict (email already exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

