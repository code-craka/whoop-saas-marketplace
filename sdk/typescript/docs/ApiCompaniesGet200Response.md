
# ApiCompaniesGet200Response


## Properties

Name | Type
------------ | -------------
`companies` | [Array&lt;ApiCompaniesGet200ResponseCompaniesInner&gt;](ApiCompaniesGet200ResponseCompaniesInner.md)
`pagination` | [Pagination](Pagination.md)

## Example

```typescript
import type { ApiCompaniesGet200Response } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "companies": null,
  "pagination": null,
} satisfies ApiCompaniesGet200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApiCompaniesGet200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


