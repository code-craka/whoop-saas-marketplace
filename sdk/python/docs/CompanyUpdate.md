# CompanyUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**title** | **str** |  | [optional] 
**email** | **str** |  | [optional] 
**logo_url** | **str** |  | [optional] 
**website_url** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**platform_fee_percent** | **float** |  | [optional] 
**payout_minimum_amount** | **float** |  | [optional] 
**payout_frequency** | **str** |  | [optional] 
**status** | **str** | Only owners can change status | [optional] 
**metadata** | **object** |  | [optional] 

## Example

```python
from whopsaas.models.company_update import CompanyUpdate

# TODO update the JSON string below
json = "{}"
# create an instance of CompanyUpdate from a JSON string
company_update_instance = CompanyUpdate.from_json(json)
# print the JSON string representation of the object
print(CompanyUpdate.to_json())

# convert the object into a dict
company_update_dict = company_update_instance.to_dict()
# create an instance of CompanyUpdate from a dict
company_update_from_dict = CompanyUpdate.from_dict(company_update_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


