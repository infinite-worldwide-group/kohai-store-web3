# Purchase Flow Documentation

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     Product Page Load                            │
│                  (StoreProduct.tsx)                              │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              GameFormSimple Component                            │
│  • Displays product title                                        │
│  • Shows available packages in grid                              │
│  • Package cards show: name, price, icon, status                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ User clicks package
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         Package Selected (Visual Feedback)                       │
│  • Selected package: blue border + ring                          │
│  • PurchaseForm appears below                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              PurchaseForm Component                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Product Details Box                                       │  │
│  │  • Display name & ID                                      │  │
│  │  • Formatted price                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Game Account Fields (if userInput exists)                │  │
│  │  • Dynamic fields from product.userInput JSON            │  │
│  │  • Example: Game ID, Server, Username, etc.             │  │
│  │  • Validation: Required fields marked with *             │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Transaction Signature Input                              │  │
│  │  • Manual entry OR                                       │  │
│  │  • "Simulate Wallet Payment" demo button                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Wallet Integration Notice                                │  │
│  │  • Instructions for installing Solana Wallet Adapter     │  │
│  │  • Demo simulation button                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [Create Order] Button                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ User submits form
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│               Form Validation                                    │
│  • Check transaction signature is not empty                      │
│  • Check all required user input fields are filled               │
│  • Show errors if validation fails                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  │ Validation passes
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│            GraphQL Mutation Call                                 │
│  mutation createOrder(                                           │
│    topupProductItemId: "123"                                     │
│    transactionSignature: "txn_sig..."                            │
│    userData: { gameId: "player123" }                             │
│  )                                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
          ┌───────┴────────┐
          │                │
    Success              Error
          │                │
          ▼                ▼
┌──────────────────┐  ┌─────────────────────┐
│  Success Screen  │  │   Error Display     │
│  • Order Number  │  │  • Red alert box    │
│  • Amount        │  │  • Error messages   │
│  • Status        │  │  • User can retry   │
│  • Transaction   │  └─────────────────────┘
│    Details       │
│  • [Create       │
│     Another      │
│     Order]       │
└──────────────────┘
```

## Component Hierarchy

```
StoreProduct.tsx
 └── GameFormSimple.tsx
      ├── Package Selection Grid
      │    └── Package Cards (with onClick)
      │
      └── PurchaseForm.tsx (conditional)
           ├── Product Details Display
           ├── User Input Fields (dynamic)
           ├── Transaction Signature Input
           ├── Wallet Integration Notice
           ├── Submit Button
           └── Success/Error Display
```

## Data Flow

### 1. Props Flow
```typescript
// StoreProduct receives product ID from URL
StoreProduct(id: string)
  │
  ├── Query: topupProduct(id)
  │
  └── Pass to GameFormSimple
       │
       └── item: TopupProductFragment
            ├── title
            ├── topupProductItems[]
            │    ├── id
            │    ├── name
            │    ├── displayName
            │    ├── price
            │    ├── formattedPrice
            │    └── active
            └── userInput (JSON schema)
```

### 2. State Management
```typescript
// GameFormSimple
const [selectedItem, setSelectedItem] = useState(null);

// PurchaseForm
const [transactionSignature, setTransactionSignature] = useState("");
const [userData, setUserData] = useState({});
const [orderResult, setOrderResult] = useState(null);
const [formErrors, setFormErrors] = useState([]);
```

### 3. Mutation Flow
```
User Input
    │
    ▼
Validation
    │
    ▼
useCreateOrderMutation({ variables })
    │
    ▼
GraphQL Request → Backend
    │
    ▼
Backend Processing:
  1. Verify transaction signature
  2. Check transaction on blockchain
  3. Create order record
  4. Link to crypto transaction
    │
    ▼
Response: CreateOrderPayload
    │
    ├── errors: string[]
    └── order?: Order
         ├── id
         ├── orderNumber
         ├── amount
         ├── currency
         ├── status
         └── cryptoTransaction
              ├── transactionSignature
              ├── network
              ├── token
              └── state
    │
    ▼
Frontend Updates:
  - Show success screen, OR
  - Show error messages
```

## Key States

### Loading State
- Submit button shows spinner
- Button text: "Processing Order..."
- Button disabled
- Form inputs remain enabled (user can see data)

### Success State
- Form is replaced with success screen
- Green checkmark icon
- Order details displayed in formatted boxes
- "Create Another Order" button resets to form

### Error State
- Red alert box appears
- Error messages listed
- Form remains visible
- User can correct and resubmit

### Validation Error State
- Errors shown before API call
- Red alert box with specific field names
- Form inputs highlighted (browser default)

## User Input Schema Example

Products can define custom user input fields:

```json
{
  "userInput": [
    {
      "name": "gameId",
      "label": "Player ID",
      "type": "text",
      "placeholder": "Enter your player ID",
      "description": "Your unique game account ID",
      "required": true
    },
    {
      "name": "server",
      "label": "Server",
      "type": "select",
      "options": ["NA", "EU", "Asia"],
      "required": true
    },
    {
      "name": "username",
      "label": "Username",
      "type": "text",
      "required": false
    }
  ]
}
```

These fields are dynamically rendered in the PurchaseForm.

## Transaction Signature

### Format
- String type (required)
- Typically 88 characters (Solana signature)
- Base58 encoded

### Demo Mode
- Click "Simulate Wallet Payment (Demo)"
- Generates: `sim_<timestamp>_<random>`
- For testing without actual blockchain

### Production Mode
When Solana Wallet Adapter is installed:
1. User connects wallet
2. App creates payment transaction
3. User signs in wallet
4. Transaction sent to blockchain
5. Signature returned
6. Signature used in createOrder mutation

## Error Scenarios

### Validation Errors
- Empty transaction signature
- Missing required user input fields
- Invalid data format

### GraphQL Errors
- Invalid product item ID
- Transaction signature not found on blockchain
- Transaction amount doesn't match
- Duplicate transaction signature
- Backend processing errors

### Network Errors
- Apollo Client errors
- Network timeout
- Server unavailable

All errors are caught and displayed to the user with clear messages.

## Testing Checklist

- [ ] Load product page
- [ ] See package grid
- [ ] Click available package (active=true)
- [ ] See purchase form appear
- [ ] See product details (name, price)
- [ ] See user input fields (if any)
- [ ] Click "Simulate Wallet Payment"
- [ ] See transaction signature populated
- [ ] Submit form
- [ ] See loading state
- [ ] See success screen
- [ ] Check order details displayed
- [ ] Click "Create Another Order"
- [ ] See form reset
- [ ] Try submitting empty form
- [ ] See validation errors
- [ ] Click unavailable package (active=false)
- [ ] Verify it can't be selected

## Performance Considerations

- GraphQL fragments reduce query size
- Lazy rendering of PurchaseForm (only when item selected)
- Optimistic updates possible (not implemented)
- Apollo cache for repeated queries
- Form state managed locally (no unnecessary re-renders)

## Accessibility

- Semantic HTML elements
- Required field indicators (*)
- Error messages associated with form
- Keyboard navigation support
- Focus management on state changes
- Alt text for product icons
- Color contrast for all states
