
# WebhookCreate


## Properties

Name | Type
------------ | -------------
`companyId` | string
`url` | string
`events` | Array&lt;string&gt;
`apiVersion` | string
`active` | boolean

## Example

```typescript
import type { WebhookCreate } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "companyId": null,
  "url": null,
  "events": null,
  "apiVersion": null,
  "active": null,
} satisfies WebhookCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WebhookCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


