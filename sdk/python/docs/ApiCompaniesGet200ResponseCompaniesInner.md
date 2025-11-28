# ApiCompaniesGet200ResponseCompaniesInner


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
**user_role** | **str** |  | [optional] 

## Example

```python
from whopsaas.models.api_companies_get200_response_companies_inner import ApiCompaniesGet200ResponseCompaniesInner

# TODO update the JSON string below
json = "{}"
# create an instance of ApiCompaniesGet200ResponseCompaniesInner from a JSON string
api_companies_get200_response_companies_inner_instance = ApiCompaniesGet200ResponseCompaniesInner.from_json(json)
# print the JSON string representation of the object
print(ApiCompaniesGet200ResponseCompaniesInner.to_json())

# convert the object into a dict
api_companies_get200_response_companies_inner_dict = api_companies_get200_response_companies_inner_instance.to_dict()
# create an instance of ApiCompaniesGet200ResponseCompaniesInner from a dict
api_companies_get200_response_companies_inner_from_dict = ApiCompaniesGet200ResponseCompaniesInner.from_dict(api_companies_get200_response_companies_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


