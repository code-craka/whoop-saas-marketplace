# ApiProductsIdDelete200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **str** |  | [optional] 
**product** | [**Product**](Product.md) |  | [optional] 

## Example

```python
from whopsaas.models.api_products_id_delete200_response import ApiProductsIdDelete200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiProductsIdDelete200Response from a JSON string
api_products_id_delete200_response_instance = ApiProductsIdDelete200Response.from_json(json)
# print the JSON string representation of the object
print(ApiProductsIdDelete200Response.to_json())

# convert the object into a dict
api_products_id_delete200_response_dict = api_products_id_delete200_response_instance.to_dict()
# create an instance of ApiProductsIdDelete200Response from a dict
api_products_id_delete200_response_from_dict = ApiProductsIdDelete200Response.from_dict(api_products_id_delete200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


