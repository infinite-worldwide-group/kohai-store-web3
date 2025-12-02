# CreateOrder Mutation Usage Guide

## Overview

The `createOrder` mutation is used to create orders with verified crypto payment. This replaces the previous `createAffiliateOrder` mutation which was part of the legacy system.

## GraphQL Files

### Mutation Definition
**Location:** `graphql/mutations/CreateOrder.graphql`

```graphql
mutation CreateOrder(
  $topupProductItemId: ID!
  $transactionSignature: String!
  $userData: JSON
) {
  createOrder(
    topupProductItemId: $topupProductItemId
    transactionSignature: $transactionSignature
    userData: $userData
  ) {
    errors
    order {
      ...Order
    }
  }
}
```

### Order Fragment
**Location:** `graphql/fragments/Order.graphql`

```graphql
fragment Order on Order {
  id
  orderNumber
  amount
  currency
  status
  orderType
  metadata
  createdAt
  updatedAt
  cryptoTransaction {
    id
    amount
    token
    network
    transactionSignature
    transactionType
    confirmations
    state
    direction
    createdAt
  }
}
```

## TypeScript Usage

### Import the Hook

```typescript
import { useCreateOrderMutation } from "graphql/generated/graphql";
```

### Basic Usage Example

```typescript
const [createOrder, { data, loading, error }] = useCreateOrderMutation();

// Call the mutation
const handleCreateOrder = async (
  topupProductItemId: string,
  transactionSignature: string,
  userData?: Record<string, any>
) => {
  try {
    const result = await createOrder({
      variables: {
        topupProductItemId,
        transactionSignature,
        userData,
      },
    });

    if (result.data?.createOrder?.errors.length === 0) {
      // Order created successfully
      const order = result.data.createOrder.order;
      console.log("Order created:", order?.orderNumber);
    } else {
      // Handle errors
      console.error("Errors:", result.data?.createOrder?.errors);
    }
  } catch (err) {
    console.error("Mutation failed:", err);
  }
};
```

### Complete Component Example

```typescript
"use client";

import { useState } from "react";
import { useCreateOrderMutation } from "graphql/generated/graphql";

const PurchaseForm = ({ productItemId }: { productItemId: string }) => {
  const [createOrder, { loading, error }] = useCreateOrderMutation();
  const [orderResult, setOrderResult] = useState<any>(null);

  const handlePurchase = async (transactionSignature: string, userData: any) => {
    try {
      const result = await createOrder({
        variables: {
          topupProductItemId: productItemId,
          transactionSignature,
          userData,
        },
      });

      if (result.data?.createOrder?.errors.length === 0) {
        setOrderResult(result.data.createOrder.order);
      } else {
        alert("Order creation failed: " + result.data?.createOrder?.errors.join(", "));
      }
    } catch (err) {
      alert("Error creating order: " + err);
    }
  };

  return (
    <div>
      {loading && <p>Creating order...</p>}
      {error && <p>Error: {error.message}</p>}
      {orderResult && (
        <div>
          <h3>Order Created Successfully!</h3>
          <p>Order Number: {orderResult.orderNumber}</p>
          <p>Amount: {orderResult.amount} {orderResult.currency}</p>
          <p>Status: {orderResult.status}</p>
        </div>
      )}
      {/* Your purchase form here */}
    </div>
  );
};
```

## Mutation Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topupProductItemId` | ID | Yes | The ID of the topup product item being purchased |
| `transactionSignature` | String | Yes | The blockchain transaction signature for payment verification |
| `userData` | JSON | No | Additional user data (e.g., game account info, user inputs) |

## Response Structure

### CreateOrderPayload

```typescript
{
  errors: string[];           // Array of error messages (empty if success)
  order?: {                   // The created order (null if failed)
    id: string;
    orderNumber: string;
    amount: number;
    currency: string;
    status: string;
    orderType: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    cryptoTransaction?: {
      id: string;
      amount?: number;
      token: string;
      network: string;
      transactionSignature: string;
      transactionType: string;
      confirmations?: number;
      state: string;
      direction: string;
      createdAt: string;
    };
  };
}
```

## Differences from createAffiliateOrder

The legacy `createAffiliateOrder` mutation (stored in `graphql/_unused_backup/mutations/`) had different parameters:

**Old (createAffiliateOrder):**
- Required: `itemId`, `email`, `userInputs`, `name`, `storeId`, `redirectUrl`, `productId`, `gateway`, optional `channel`
- Used traditional payment gateways (Billplz, Fiuu)
- Required redirect URLs for payment processing

**New (createOrder):**
- Required: `topupProductItemId`, `transactionSignature`
- Optional: `userData`
- Uses crypto payment verification
- No redirect URLs needed (payment verified on-chain)
- Simpler parameter structure

## Backend Implementation

The mutation is defined in the GraphQL schema under:
```
module Mutations
  module Orders
    class CreateOrder < Types::BaseMutation
```

The mutation:
1. Verifies the crypto transaction signature
2. Creates the order record
3. Links it to the crypto transaction
4. Returns the order with transaction details

## Error Handling

Always check the `errors` array in the response:

```typescript
if (result.data?.createOrder?.errors.length > 0) {
  // Handle errors
  result.data.createOrder.errors.forEach(error => {
    console.error(error);
  });
} else {
  // Success
  const order = result.data?.createOrder?.order;
}
```

## Testing

You can test the mutation using the GraphQL playground or Apollo Client DevTools with:

```graphql
mutation TestCreateOrder {
  createOrder(
    topupProductItemId: "123"
    transactionSignature: "transaction_sig_here"
    userData: { gameId: "player123", server: "NA" }
  ) {
    errors
    order {
      id
      orderNumber
      status
    }
  }
}
```

## Related Files

- Mutation: `graphql/mutations/CreateOrder.graphql`
- Fragment: `graphql/fragments/Order.graphql`
- Generated Types: `graphql/generated/graphql.tsx`
- Schema: `graphql.schema.json`
- Legacy mutation (backup): `graphql/_unused_backup/mutations/CreateAffiliateOrder.graphql`
