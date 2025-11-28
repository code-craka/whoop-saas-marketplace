# CompanyCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** |  | 
**email** | **str** |  | 
**type** | **str** |  | [optional] [default to 'sub_merchant']
**logo_url** | **str** |  | [optional] 
**website_url** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**platform_fee_percent** | **float** |  | [optional] [default to 5.0]
**payout_minimum_amount** | **float** |  | [optional] [default to 50.0]
**payout_frequency** | **str** |  | [optional] [default to 'weekly']
**metadata** | **object** |  | [optional] 

## Example

```python
from whopsaas.models.company_create import CompanyCreate

# TODO update the JSON string below
json = "{}"
# create an instance of CompanyCreate from a JSON string
company_create_instance = CompanyCreate.from_json(json)
# print the JSON string representation of the object
print(CompanyCreate.to_json())

# convert the object into a dict
company_create_dict = company_create_instance.to_dict()
# create an instance of CompanyCreate from a dict
company_create_from_dict = CompanyCreate.from_dict(company_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


