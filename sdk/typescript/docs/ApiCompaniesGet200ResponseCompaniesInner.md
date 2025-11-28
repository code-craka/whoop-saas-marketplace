
# ApiCompaniesGet200ResponseCompaniesInner


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`status` | string
`title` | string
`email` | string
`slug` | string
`logoUrl` | string
`websiteUrl` | string
`description` | string
`platformFeePercent` | number
`payoutMinimumAmount` | number
`payoutFrequency` | string
`stripeAccountId` | string
`stripeOnboarded` | boolean
`metadata` | object
`createdAt` | Date
`updatedAt` | Date
`count` | [CompanyCount](CompanyCount.md)
`userRole` | string

## Example

```typescript
import type { ApiCompaniesGet200ResponseCompaniesInner } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "id": biz_abc123,
  "type": null,
  "status": null,
  "title": null,
  "email": null,
  "slug": my-saas-company,
  "logoUrl": null,
  "websiteUrl": null,
  "description": null,
  "platformFeePercent": 5.0,
  "payoutMinimumAmount": 50.0,
  "payoutFrequency": null,
  "stripeAccountId": null,
  "stripeOnboarded": null,
  "metadata": null,
  "createdAt": null,
  "updatedAt": null,
  "count": null,
  "userRole": null,
} satisfies ApiCompaniesGet200ResponseCompaniesInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApiCompaniesGet200ResponseCompaniesInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


