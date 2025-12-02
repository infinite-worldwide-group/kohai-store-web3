# Quick Start: Purchase Form with createOrder Mutation

## What Changed?

The purchase form now uses the `createOrder` mutation instead of showing a warning message. Users can now complete purchases using crypto payments!

## Try It Out

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to a Product Page
Open your browser and go to:
```
http://localhost:3006/store/{product-slug-or-id}
```

Example:
```
http://localhost:3006/store/mobile-legends
http://localhost:3006/store/1
```

### 3. Select a Package
- You'll see a grid of available packages
- Click on any **active** package (packages with prices shown)
- The package will highlight in blue

### 4. Fill in the Form
The purchase form will appear with:
- **Product details** (name and price)
- **Game account fields** (if required by the product)
- **Transaction signature field**

### 5. Demo Mode Testing
Click the **"Simulate Wallet Payment (Demo)"** button to:
- Generate a test transaction signature
- Test the form without a real wallet

### 6. Submit
Click **"Create Order"** to:
- Validate the form
- Call the `createOrder` mutation
- See the result (success or error)

### 7. Success!
If successful, you'll see:
- ✅ Order number
- ✅ Amount and currency
- ✅ Order status
- ✅ Transaction details

## Files You Can Modify

### To Customize the Purchase Form UI
Edit: `src/components/Store/TopupProducts/PurchaseForm.tsx`

Examples:
- Change colors/styling
- Add more fields
- Modify success screen
- Add analytics tracking

### To Customize Package Selection
Edit: `src/components/Store/TopupProducts/GameFormSimple.tsx`

Examples:
- Change grid layout
- Modify package card design
- Add filters/search
- Change selection behavior

### To Add More Order Fields
Edit: `graphql/fragments/Order.graphql`

Then run:
```bash
npm run codegen
```

## Key Features

### ✅ What Works Now
- Package selection with visual feedback
- Dynamic user input fields (from product schema)
- Transaction signature input
- Demo mode for testing
- Full error handling
- Success screen with order details
- Form validation
- Loading states

### 🚧 What's Next (Optional)
- Install Solana Wallet Adapter for real payments
- Add order history page
- Add payment confirmation step
- Integrate with real blockchain
- Add email notifications

## Mutation Parameters

The `createOrder` mutation accepts:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topupProductItemId` | ID | ✅ Yes | The ID of the package selected |
| `transactionSignature` | String | ✅ Yes | Blockchain transaction proof |
| `userData` | JSON | ❌ No | Game account info, user inputs |

## Response Structure

On success, you get:
```typescript
{
  order: {
    id: "123"
    orderNumber: "ORD-2024-001"
    amount: 100.50
    currency: "USDC"
    status: "completed"
    cryptoTransaction: {
      transactionSignature: "txn_abc123..."
      network: "solana"
      token: "USDC"
    }
  }
}
```

## Common Issues

### Issue: "Transaction signature is required"
**Solution:** Click "Simulate Wallet Payment" or enter a test signature

### Issue: "Missing required fields"
**Solution:** Fill in all fields marked with a red asterisk (*)

### Issue: Package not selectable
**Solution:** Only packages with `active: true` can be selected

### Issue: GraphQL errors
**Solution:** Check that your backend is running and the `createOrder` mutation is enabled

## Backend Requirements

Your GraphQL backend must have:
1. ✅ `createOrder` mutation defined
2. ✅ Transaction signature verification
3. ✅ Order creation logic
4. ✅ Crypto transaction tracking

Check: `graphql.schema.json` for the schema

## Testing Checklist

Quick test steps:
1. [ ] Load product page
2. [ ] Click a package
3. [ ] See form appear
4. [ ] Click "Simulate Wallet Payment"
5. [ ] Submit form
6. [ ] See success screen
7. [ ] Click "Create Another Order"
8. [ ] Form resets

## Documentation

For more details, see:
- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Usage Guide:** `docs/CREATE_ORDER_USAGE.md`
- **Flow Diagram:** `docs/PURCHASE_FLOW.md`

## Questions?

1. Check the documentation files above
2. Review the GraphQL schema: `graphql.schema.json`
3. Inspect generated types: `graphql/generated/graphql.tsx`
4. Look at example code in `PurchaseForm.tsx`

## Next Steps

### For Development
```bash
# Run the app
npm run dev

# Generate GraphQL types (after schema changes)
npm run codegen

# Build for production
npm run build
```

### For Production Deployment
1. Ensure backend is ready with `createOrder` mutation
2. Configure environment variables
3. Install Solana Wallet Adapter (optional)
4. Test with real transactions on devnet first
5. Deploy to production

## Feature Status

| Feature | Status |
|---------|--------|
| Package selection | ✅ Done |
| Purchase form | ✅ Done |
| createOrder mutation | ✅ Done |
| Demo/simulation mode | ✅ Done |
| Error handling | ✅ Done |
| Success screen | ✅ Done |
| Form validation | ✅ Done |
| User input fields | ✅ Done |
| TypeScript types | ✅ Done |
| Wallet integration | 🚧 Optional |
| Order history | 🚧 Future |
| Email notifications | 🚧 Future |

---

**You're all set! Start the dev server and try it out!** 🚀
