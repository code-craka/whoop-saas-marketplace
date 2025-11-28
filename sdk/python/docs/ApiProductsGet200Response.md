# ApiProductsGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**products** | [**List[Product]**](Product.md) |  | [optional] 
**pagination** | [**Pagination**](Pagination.md) |  | [optional] 

## Example

```python
from whopsaas.models.api_products_get200_response import ApiProductsGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiProductsGet200Response from a JSON string
api_products_get200_response_instance = ApiProductsGet200Response.from_json(json)
# print the JSON string representation of the object
print(ApiProductsGet200Response.to_json())

# convert the object into a dict
api_products_get200_response_dict = api_products_get200_response_instance.to_dict()
# create an instance of ApiProductsGet200Response from a dict
api_products_get200_response_from_dict = ApiProductsGet200Response.from_dict(api_products_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


