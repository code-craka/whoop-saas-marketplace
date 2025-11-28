# ApiCompaniesGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**companies** | [**List[ApiCompaniesGet200ResponseCompaniesInner]**](ApiCompaniesGet200ResponseCompaniesInner.md) |  | [optional] 
**pagination** | [**Pagination**](Pagination.md) |  | [optional] 

## Example

```python
from whopsaas.models.api_companies_get200_response import ApiCompaniesGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiCompaniesGet200Response from a JSON string
api_companies_get200_response_instance = ApiCompaniesGet200Response.from_json(json)
# print the JSON string representation of the object
print(ApiCompaniesGet200Response.to_json())

# convert the object into a dict
api_companies_get200_response_dict = api_companies_get200_response_instance.to_dict()
# create an instance of ApiCompaniesGet200Response from a dict
api_companies_get200_response_from_dict = ApiCompaniesGet200Response.from_dict(api_companies_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


