# ProductUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**image_url** | **str** |  | [optional] 
**price_amount** | **float** |  | [optional] 
**price_minor_units** | **int** |  | [optional] 
**currency** | **str** |  | [optional] 
**plan_type** | **str** |  | [optional] 
**billing_period** | **int** |  | [optional] 
**trial_days** | **int** |  | [optional] 
**active** | **bool** |  | [optional] 
**metadata** | **object** |  | [optional] 

## Example

```python
from whopsaas.models.product_update import ProductUpdate

# TODO update the JSON string below
json = "{}"
# create an instance of ProductUpdate from a JSON string
product_update_instance = ProductUpdate.from_json(json)
# print the JSON string representation of the object
print(ProductUpdate.to_json())

# convert the object into a dict
product_update_dict = product_update_instance.to_dict()
# create an instance of ProductUpdate from a dict
product_update_from_dict = ProductUpdate.from_dict(product_update_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


