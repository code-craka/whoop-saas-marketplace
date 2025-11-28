# CompanyCount


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**products** | **int** |  | [optional] 
**memberships** | **int** |  | [optional] 
**payments** | **int** |  | [optional] 
**users** | **int** |  | [optional] 

## Example

```python
from whopsaas.models.company_count import CompanyCount

# TODO update the JSON string below
json = "{}"
# create an instance of CompanyCount from a JSON string
company_count_instance = CompanyCount.from_json(json)
# print the JSON string representation of the object
print(CompanyCount.to_json())

# convert the object into a dict
company_count_dict = company_count_instance.to_dict()
# create an instance of CompanyCount from a dict
company_count_from_dict = CompanyCount.from_dict(company_count_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


