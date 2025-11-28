# ApiWebhooksPost201Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **str** |  | [optional] 
**company_id** | **str** |  | [optional] 
**url** | **str** |  | [optional] 
**events** | **List[str]** |  | [optional] 
**api_version** | **str** |  | [optional] [default to 'v1']
**secret** | **str** | Full HMAC secret (save securely, won&#39;t be shown again) | [optional] 
**active** | **bool** |  | [optional] 
**created_at** | **datetime** |  | [optional] 
**count** | [**WebhookCount**](WebhookCount.md) |  | [optional] 
**warning** | **str** |  | [optional] 

## Example

```python
from whopsaas.models.api_webhooks_post201_response import ApiWebhooksPost201Response

# TODO update the JSON string below
json = "{}"
# create an instance of ApiWebhooksPost201Response from a JSON string
api_webhooks_post201_response_instance = ApiWebhooksPost201Response.from_json(json)
# print the JSON string representation of the object
print(ApiWebhooksPost201Response.to_json())

# convert the object into a dict
api_webhooks_post201_response_dict = api_webhooks_post201_response_instance.to_dict()
# create an instance of ApiWebhooksPost201Response from a dict
api_webhooks_post201_response_from_dict = ApiWebhooksPost201Response.from_dict(api_webhooks_post201_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


