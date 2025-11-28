# ApiMembershipsGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**memberships** | [**List[Membership]**](Membership.md) |  | [optional] 
**pagination** | [**Pagination**](Pagination.md) |  | [optional] 

## Example

```python
from whopsaas.models.api_memberships_get200_response import ApiMembershipsGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiMembershipsGet200Response from a JSON string
api_memberships_get200_response_instance = ApiMembershipsGet200Response.from_json(json)
# print the JSON string representation of the object
print(ApiMembershipsGet200Response.to_json())

# convert the object into a dict
api_memberships_get200_response_dict = api_memberships_get200_response_instance.to_dict()
# create an instance of ApiMembershipsGet200Response from a dict
api_memberships_get200_response_from_dict = ApiMembershipsGet200Response.from_dict(api_memberships_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


