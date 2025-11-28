
# CompanyCreate


## Properties

Name | Type
------------ | -------------
`title` | string
`email` | string
`type` | string
`logoUrl` | string
`websiteUrl` | string
`description` | string
`platformFeePercent` | number
`payoutMinimumAmount` | number
`payoutFrequency` | string
`metadata` | object

## Example

```typescript
import type { CompanyCreate } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "email": null,
  "type": null,
  "logoUrl": null,
  "websiteUrl": null,
  "description": null,
  "platformFeePercent": null,
  "payoutMinimumAmount": null,
  "payoutFrequency": null,
  "metadata": null,
} satisfies CompanyCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CompanyCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


