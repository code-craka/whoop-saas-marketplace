# Membership


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | [optional] 
**user_id** | **str** |  | [optional] 
**product_id** | **str** |  | [optional] 
**company_id** | **str** |  | [optional] 
**status** | **str** |  | [optional] 
**stripe_subscription_id** | **str** |  | [optional] 
**current_period_start** | **datetime** |  | [optional] 
**current_period_end** | **datetime** |  | [optional] 
**cancel_at** | **datetime** |  | [optional] 
**canceled_at** | **datetime** |  | [optional] 
**trial_end** | **datetime** |  | [optional] 
**metadata** | **object** |  | [optional] 
**created_at** | **datetime** |  | [optional] 
**updated_at** | **datetime** |  | [optional] 
**user** | [**MembershipUser**](MembershipUser.md) |  | [optional] 
**product** | [**Product**](Product.md) |  | [optional] 
**company** | [**Company**](Company.md) |  | [optional] 

## Example

```python
from whopsaas.models.membership import Membership

# TODO update the JSON string below
json = "{}"
# create an instance of Membership from a JSON string
membership_instance = Membership.from_json(json)
# print the JSON string representation of the object
print(Membership.to_json())

# convert the object into a dict
membership_dict = membership_instance.to_dict()
# create an instance of Membership from a dict
membership_from_dict = Membership.from_dict(membership_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


