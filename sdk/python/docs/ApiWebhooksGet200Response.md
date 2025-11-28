# ApiWebhooksGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**webhooks** | [**List[Webhook]**](Webhook.md) |  | [optional] 
**pagination** | [**Pagination**](Pagination.md) |  | [optional] 

## Example

```python
from whopsaas.models.api_webhooks_get200_response import ApiWebhooksGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiWebhooksGet200Response from a JSON string
api_webhooks_get200_response_instance = ApiWebhooksGet200Response.from_json(json)
# print the JSON string representation of the object
print(ApiWebhooksGet200Response.to_json())

# convert the object into a dict
api_webhooks_get200_response_dict = api_webhooks_get200_response_instance.to_dict()
# create an instance of ApiWebhooksGet200Response from a dict
api_webhooks_get200_response_from_dict = ApiWebhooksGet200Response.from_dict(api_webhooks_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


