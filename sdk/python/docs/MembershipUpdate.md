# MembershipUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** | Only company admins can change status | [optional] 
**cancel_at** | **datetime** | Schedule cancellation (members can cancel own) | [optional] 
**metadata** | **object** | Only company admins can update metadata | [optional] 

## Example

```python
from whopsaas.models.membership_update import MembershipUpdate

# TODO update the JSON string below
json = "{}"
# create an instance of MembershipUpdate from a JSON string
membership_update_instance = MembershipUpdate.from_json(json)
# print the JSON string representation of the object
print(MembershipUpdate.to_json())

# convert the object into a dict
membership_update_dict = membership_update_instance.to_dict()
# create an instance of MembershipUpdate from a dict
membership_update_from_dict = MembershipUpdate.from_dict(membership_update_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


