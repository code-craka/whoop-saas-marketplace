# ProductCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**company_id** | **str** |  | 
**title** | **str** |  | 
**description** | **str** |  | [optional] 
**image_url** | **str** |  | [optional] 
**price_amount** | **float** | Price in dollars (e.g., 49.99) | [optional] 
**price_minor_units** | **int** | Price in cents (e.g., 4999) - provide EITHER this OR price_amount | [optional] 
**currency** | **str** |  | [optional] [default to 'USD']
**plan_type** | **str** |  | 
**billing_period** | **int** |  | [optional] 
**trial_days** | **int** |  | [optional] [default to 0]
**active** | **bool** |  | [optional] [default to True]
**metadata** | **object** |  | [optional] 

## Example

```python
from whopsaas.models.product_create import ProductCreate

# TODO update the JSON string below
json = "{}"
# create an instance of ProductCreate from a JSON string
product_create_instance = ProductCreate.from_json(json)
# print the JSON string representation of the object
print(ProductCreate.to_json())

# convert the object into a dict
product_create_dict = product_create_instance.to_dict()
# create an instance of ProductCreate from a dict
product_create_from_dict = ProductCreate.from_dict(product_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


