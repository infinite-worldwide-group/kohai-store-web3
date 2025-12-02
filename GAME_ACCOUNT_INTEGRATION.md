# Game Account Integration Guide

## ✅ FULLY IMPLEMENTED - Game Account Management

Complete game account feature with:
- **Auto-save** after every purchase
- **Load saved accounts** with one click
- **Delete accounts** (sets disabled = true)
- **Visual indicators** for verified accounts

## How It Works

### 1. Imports Added (PurchaseForm.tsx:4)

```typescript
import {
  useCreateOrderMutation,
  useAuthenticateWalletMutation,
  useCurrentUserQuery,
  useCreateGameAccountMutation,  // ✅ ADDED
  TopupProductItemFragment
} from "graphql/generated/graphql";
```

### 2. Mutation Hook Initialized (PurchaseForm.tsx:20)

```typescript
const [createOrder, { error }] = useCreateOrderMutation();
const [authenticateWallet] = useAuthenticateWalletMutation();
const [createGameAccount] = useCreateGameAccountMutation(); // ✅ ADDED
```

### 3. Auto-Save Logic (PurchaseForm.tsx:561-604)

After successful order creation, game account is automatically saved:

```typescript
setOrderResult(result.data.createOrder.order);

// Automatically save game account after successful order
if (Object.keys(userData).length > 0) {
  try {
    console.log('💾 Auto-saving game account...');

    // Extract accountId and serverId from userData
    const accountId = userData["User ID"] ||
                     userData["Player ID"] ||
                     userData["UID"] ||
                     userData["Account ID"] ||
                     userData[Object.keys(userData)[0]]; // Fallback

    const serverId = userData["insert server value"] ||
                    userData["Server"] ||
                    userData["Region"] ||
                    null;

    const inGameName = userData["Character Name"] ||
                      userData["In-Game Name"] ||
                      null;

    const gameAccountResult = await createGameAccount({
      variables: {
        topupProductId: parseInt(productItem.topupProduct?.id || '0'),
        accountId: accountId,
        serverId: serverId || undefined,
        inGameName: inGameName || undefined,
        userData: userData, // Complete form data
      },
    });

    if (gameAccountResult.data?.createGameAccount?.gameAccount) {
      console.log('✅ Game account auto-saved');
    }
  } catch (gameAccountError) {
    console.error('Error auto-saving game account:', gameAccountError);
    // Non-blocking: Order still succeeds if save fails
  }
}
```

## How It Works - Complete Flow

### User Flow:
1. **User selects product**: Mobile Legends - 100 Diamonds
2. **Form appears with fields** from product's `userInput`:
   - "User ID" (required)
   - "insert server value" (dropdown for server)
3. **User fills form**:
   ```
   User ID: 9997766
   Server: os_asia
   ```
4. **User checks "Save Account"** ☑️
5. **User completes payment** → Order created
6. **After successful order**:
   - Order is saved ✅
   - Game account is automatically saved ✅

### Backend Receives:
```graphql
mutation {
  createGameAccount(
    topupProductId: 40              # From productItem.topupProduct.id
    accountId: "9997766"            # Extracted from userData["User ID"]
    serverId: "os_asia"             # Extracted from userData["insert server value"]
    inGameName: null                # Not provided in this example
    userData: {                     # Complete form data
      "User ID": "9997766",
      "insert server value": "os_asia"
    }
  )
}
```

### userData Field Mapping:

The code automatically maps common field patterns:

| Backend Field | Common userData Keys (Priority Order) |
|--------------|--------------------------------------|
| `accountId`  | "User ID" → "Player ID" → "UID" → "Account ID" → first field |
| `serverId`   | "insert server value" → "Server" → "Region" |
| `inGameName` | "Character Name" → "In-Game Name" |

**Important:** The `userData` JSON preserves the EXACT field names from your product's `userInput` schema, which is what the vendor API expects.

## Example for Different Games:

### Mobile Legends:
```json
{
  "User ID": "9997766",
  "insert server value": "os_asia"
}
```

### PUBG Mobile:
```json
{
  "Player ID": "5123456789",
  "Character Name": "ProGamer123"
}
```

### Genshin Impact:
```json
{
  "UID": "600123456",
  "Server": "America"
}
```

## Next Steps:

After implementing this, users can:
1. ✅ Save game accounts during checkout
2. 🔜 Load saved accounts (next feature to implement)
3. 🔜 Delete saved accounts (if backend supports it)
