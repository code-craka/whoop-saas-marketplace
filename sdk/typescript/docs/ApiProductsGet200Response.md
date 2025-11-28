
# ApiProductsGet200Response


## Properties

Name | Type
------------ | -------------
`products` | [Array&lt;Product&gt;](Product.md)
`pagination` | [Pagination](Pagination.md)

## Example

```typescript
import type { ApiProductsGet200Response } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "products": null,
  "pagination": null,
} satisfies ApiProductsGet200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApiProductsGet200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


