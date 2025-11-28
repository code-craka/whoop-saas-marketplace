
# ProductCreate


## Properties

Name | Type
------------ | -------------
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

## Example

```typescript
import type { ProductCreate } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "companyId": null,
  "title": null,
  "description": null,
  "imageUrl": null,
  "priceAmount": null,
  "priceMinorUnits": null,
  "currency": null,
  "planType": null,
  "billingPeriod": null,
  "trialDays": null,
  "active": null,
  "metadata": null,
} satisfies ProductCreate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductCreate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


