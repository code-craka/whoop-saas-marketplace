
# CompanyCount


## Properties

Name | Type
------------ | -------------
`products` | number
`memberships` | number
`payments` | number
`users` | number

## Example

```typescript
import type { CompanyCount } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "products": null,
  "memberships": null,
  "payments": null,
  "users": null,
} satisfies CompanyCount

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CompanyCount
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


