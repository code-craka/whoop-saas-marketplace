# MembershipUser


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | [optional] 
**email** | **str** |  | [optional] 
**name** | **str** |  | [optional] 
**avatar_url** | **str** |  | [optional] 

## Example

```python
from whopsaas.models.membership_user import MembershipUser

# TODO update the JSON string below
json = "{}"
# create an instance of MembershipUser from a JSON string
membership_user_instance = MembershipUser.from_json(json)
# print the JSON string representation of the object
print(MembershipUser.to_json())

# convert the object into a dict
membership_user_dict = membership_user_instance.to_dict()
# create an instance of MembershipUser from a dict
membership_user_from_dict = MembershipUser.from_dict(membership_user_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


