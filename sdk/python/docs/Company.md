# Company


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | [optional] 
**type** | **str** |  | [optional] 
**status** | **str** |  | [optional] 
**title** | **str** |  | [optional] 
**email** | **str** |  | [optional] 
**slug** | **str** |  | [optional] 
**logo_url** | **str** |  | [optional] 
**website_url** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**platform_fee_percent** | **float** |  | [optional] 
**payout_minimum_amount** | **float** |  | [optional] 
**payout_frequency** | **str** |  | [optional] 
**stripe_account_id** | **str** |  | [optional] 
**stripe_onboarded** | **bool** |  | [optional] 
**metadata** | **object** |  | [optional] 
**created_at** | **datetime** |  | [optional] 
**updated_at** | **datetime** |  | [optional] 
**count** | [**CompanyCount**](CompanyCount.md) |  | [optional] 

## Example

```python
from whopsaas.models.company import Company

# TODO update the JSON string below
json = "{}"
# create an instance of Company from a JSON string
company_instance = Company.from_json(json)
# print the JSON string representation of the object
print(Company.to_json())

# convert the object into a dict
company_dict = company_instance.to_dict()
# create an instance of Company from a dict
company_from_dict = Company.from_dict(company_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


