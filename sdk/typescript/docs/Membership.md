
# Membership


## Properties

Name | Type
------------ | -------------
`id` | string
`userId` | string
`productId` | string
`companyId` | string
`status` | string
`stripeSubscriptionId` | string
`currentPeriodStart` | Date
`currentPeriodEnd` | Date
`cancelAt` | Date
`canceledAt` | Date
`trialEnd` | Date
`metadata` | object
`createdAt` | Date
`updatedAt` | Date
`user` | [MembershipUser](MembershipUser.md)
`product` | [Product](Product.md)
`company` | [Company](Company.md)

## Example

```typescript
import type { Membership } from '@whopsaas/sdk'

// TODO: Update the object below with actual values
const example = {
  "id": mem_abc123,
  "userId": null,
  "productId": null,
  "companyId": null,
  "status": null,
  "stripeSubscriptionId": null,
  "currentPeriodStart": null,
  "currentPeriodEnd": null,
  "cancelAt": null,
  "canceledAt": null,
  "trialEnd": null,
  "metadata": null,
  "createdAt": null,
  "updatedAt": null,
  "user": null,
  "product": null,
  "company": null,
} satisfies Membership

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Membership
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


