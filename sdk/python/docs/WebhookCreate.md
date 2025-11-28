# WebhookCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**company_id** | **str** |  | 
**url** | **str** |  | 
**events** | **List[str]** |  | 
**api_version** | **str** |  | [optional] [default to 'v1']
**active** | **bool** |  | [optional] [default to True]

## Example

```python
from whopsaas.models.webhook_create import WebhookCreate

# TODO update the JSON string below
json = "{}"
# create an instance of WebhookCreate from a JSON string
webhook_create_instance = WebhookCreate.from_json(json)
# print the JSON string representation of the object
print(WebhookCreate.to_json())

# convert the object into a dict
webhook_create_dict = webhook_create_instance.to_dict()
# create an instance of WebhookCreate from a dict
webhook_create_from_dict = WebhookCreate.from_dict(webhook_create_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


