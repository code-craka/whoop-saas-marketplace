
# ApiWebhooksPost201Response


## Properties

Name | Type
------------ | -------------
`id` | string
`companyId` | string
`url` | string
`events` | Array&lt;string&gt;
`apiVersion` | string
`secret` | string
`active` | boolean
`createdAt` | Date
`count` | [WebhookCount](WebhookCount.md)
`warning` | string

## Example

```typescript
import type { ApiWebhooksPost201Response } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "id": whk_abc123,
  "companyId": null,
  "url": null,
  "events": null,
  "apiVersion": null,
  "secret": null,
  "active": null,
  "createdAt": null,
  "count": null,
  "warning": null,
} satisfies ApiWebhooksPost201Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApiWebhooksPost201Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


