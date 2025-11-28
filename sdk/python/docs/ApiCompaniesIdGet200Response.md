# ApiCompaniesIdGet200Response


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
from whopsaas.models.api_companies_id_get200_response import ApiCompaniesIdGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiCompaniesIdGet200Response from a JSON string
api_companies_id_get200_response_instance = ApiCompaniesIdGet200Response.from_json(json)
# print the JSON string representation of the object
print(ApiCompaniesIdGet200Response.to_json())

# convert the object into a dict
api_companies_id_get200_response_dict = api_companies_id_get200_response_instance.to_dict()
# create an instance of ApiCompaniesIdGet200Response from a dict
api_companies_id_get200_response_from_dict = ApiCompaniesIdGet200Response.from_dict(api_companies_id_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


