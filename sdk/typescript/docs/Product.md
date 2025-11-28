
# Product


## Properties

Name | Type
------------ | -------------
`id` | string
`companyId` | string
`title` | string
`description` | string
`imageUrl` | string
`priceAmount` | number
`priceMinorUnits` | number
`currency` | string
`planType` | string
`billingPeriod` | number
`trialDays` | number
`active` | boolean
`metadata` | object
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { Product } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "id": prod_abc123,
  "companyId": biz_xyz789,
  "title": Pro Plan,
  "description": Premium features with priority support,
  "imageUrl": null,
  "priceAmount": 49.99,
  "priceMinorUnits": 4999,
  "currency": USD,
  "planType": null,
  "billingPeriod": null,
  "trialDays": 14,
  "active": null,
  "metadata": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies Product

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Product
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


