# ✅ Reown Wallet Integration - Complete Setup Guide

## 🎉 What's Been Added

Your store now has **full wallet integration** with Reown (WalletConnect)! Users can:

1. ✅ **Connect wallet** from any page (button in top-right header)
2. ✅ **Stay logged in** across all pages
3. ✅ **Pay with crypto** directly from their wallet
4. ✅ **Auto-capture transaction signatures** for orders

---

## 📋 Installation Steps

### Step 1: Install Dependencies

```bash
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps
```

> **Note:** If you get permission errors, run:
> ```bash
> sudo chown -R $(whoami) "/Users/$(whoami)/.npm"
> ```

### Step 2: Set Environment Variables

Create or update `.env.local` with:

```env
# Required: Get from https://cloud.reown.com/
NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_here

# Optional: Custom Solana RPC endpoint
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Required: Your merchant wallet address for receiving payments
NEXT_PUBLIC_MERCHANT_WALLET=your_solana_wallet_address
```

#### How to Get Your Reown Project ID:

1. Go to https://cloud.reown.com/
2. Sign in or create account
3. Click "New Project"
4. Name it "Kohai Store" or similar
5. Copy the **Project ID**
6. Paste it in `.env.local`

### Step 3: Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3006 and you'll see the wallet button in the header!

---

## 🎨 What You'll See

### Header (All Pages)
- **Top-right corner**: Wallet button
  - **Not connected**: "Connect Wallet" button
  - **Connected**: Shortened address (0x1234...5678)
  - **Click when connected**: Dropdown showing:
    - Full wallet address
    - SOL balance
    - Copy address button
    - Disconnect button

### Product Page
When user selects a package:
- **Not connected**: "Connect Wallet to Pay" button
- **Connected**: "Pay [amount] SOL" button
- **After payment**: Auto-filled transaction signature
- **Submit**: Creates order with signature

---

## 🔧 Files Created/Modified

### New Files:
1. **`src/lib/reown-config.ts`**
   - Configures Reown AppKit
   - Sets up Solana wallet adapters (Phantom, Solflare)
   - Customizes theme and colors

2. **`src/contexts/WalletContext.tsx`**
   - React context for wallet state
   - Provides hooks: `useWallet()`
   - Functions: connect, disconnect, signMessage, sendTransaction

3. **`src/components/WalletConnect/WalletButton.tsx`**
   - Compact wallet button for header
   - Dropdown with balance and actions
   - Responsive design

### Modified Files:
1. **`src/app/layout.tsx`**
   - Added `WalletProvider` wrapper
   - Imports Reown config

2. **`src/components/User/Header/index.tsx`**
   - Added wallet button to header

3. **`src/components/Premium/Header/index.tsx`**
   - Added wallet button to premium header

4. **`src/components/Store/TopupProducts/PurchaseForm.tsx`**
   - Integrated wallet payment
   - Auto-fills transaction signature
   - Shows wallet connection status

---

## 🚀 User Flow

### Connecting Wallet

```
1. User clicks "Connect Wallet" (top-right)
   ↓
2. Reown modal opens
   ↓
3. User selects wallet (Phantom, Solflare, etc.)
   ↓
4. Wallet app opens and requests approval
   ↓
5. User approves
   ↓
6. Connected! ✅
   - Button shows wallet address
   - User stays connected across pages
```

### Making a Purchase

```
1. User visits product page
   ↓
2. Selects a package
   ↓
3. Fills in game account info (if required)
   ↓
4. Clicks "Pay [amount] SOL"
   ↓
5. Wallet prompts for payment approval
   ↓
6. User approves transaction
   ↓
7. Transaction sent to blockchain
   ↓
8. Signature auto-filled in form
   ↓
9. User clicks "Create Order"
   ↓
10. Order created with transaction proof! 🎉
```

---

## 🔑 Key Components

### useWallet Hook

```typescript
import { useWallet } from "@/contexts/WalletContext";

const MyComponent = () => {
  const {
    isConnected,      // boolean
    address,          // string (wallet address)
    connect,          // () => void
    disconnect,       // () => void
    sendTransaction,  // (to, amount) => Promise<signature>
    signMessage,      // (message) => Promise<signature>
    getBalance,       // () => Promise<number>
  } = useWallet();

  return (
    <button onClick={connect}>
      {isConnected ? address : 'Connect Wallet'}
    </button>
  );
};
```

### Payment Example

```typescript
const handlePayment = async () => {
  const merchantWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET;
  const amount = 0.1; // SOL

  const signature = await sendTransaction(merchantWallet, amount);

  if (signature) {
    // Use signature to create order
    await createOrder({
      variables: {
        topupProductItemId: "123",
        transactionSignature: signature,
      }
    });
  }
};
```

---

## ⚙️ Configuration

### Change Network (Mainnet/Devnet)

Edit `src/lib/reown-config.ts`:

```typescript
// For MAINNET (production):
export const defaultNetwork = solana;

// For DEVNET (testing):
export const defaultNetwork = solanaDevnet;

// For TESTNET:
export const defaultNetwork = solanaTestnet;
```

### Add More Wallets

Edit `src/lib/reown-config.ts`:

```typescript
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter, // Add new wallet
} from '@solana/wallet-adapter-wallets';

export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(), // Add here
  ]
});
```

### Customize Theme

Edit `src/lib/reown-config.ts`:

```typescript
export const modal = createAppKit({
  // ... other config
  themeMode: 'dark', // or 'light'
  themeVariables: {
    '--w3m-accent': '#3b82f6',    // Blue (change to your brand color)
    '--w3m-border-radius-master': '8px',
  }
});
```

---

## 🧪 Testing

### Demo Mode (No Wallet Required)

On the purchase form, click **"Simulate Payment (Demo Mode)"** to:
- Generate a fake transaction signature
- Test the order creation flow
- No blockchain interaction

### Testing with Devnet

1. Set network to `devnet` (default)
2. Get free SOL: https://solfaucet.com/
3. Connect real wallet (Phantom, etc.)
4. Make actual test transactions

---

## 🔒 Security Notes

1. **Never commit `.env.local`** (already in .gitignore)
2. **Merchant wallet**: Use a dedicated wallet for receiving payments
3. **Backend verification**: Your backend should verify transaction signatures
4. **Amount validation**: Backend should check transaction amount matches product price

---

## 📱 Mobile Support

Reown (WalletConnect) supports mobile wallets:

1. User clicks "Connect Wallet" on mobile
2. QR code appears (or deep link on mobile)
3. Opens wallet app (Phantom Mobile, Solflare Mobile)
4. User approves connection
5. Connected! Works seamlessly

---

## 🐛 Troubleshooting

### "Project ID not set" Warning

**Solution:** Add `NEXT_PUBLIC_REOWN_PROJECT_ID` to `.env.local`

### Wallet Button Not Showing

**Solution:**
1. Check that dependencies are installed
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Transaction Fails

**Causes:**
- Insufficient SOL balance
- Wrong network (mainnet vs devnet)
- Invalid merchant wallet address

**Solutions:**
- Get devnet SOL: https://solfaucet.com/
- Check `.env.local` has correct `NEXT_PUBLIC_MERCHANT_WALLET`
- Verify network matches wallet network

### Wallet Disconnects

**Solution:** This is normal behavior. Wallets disconnect after:
- Browser refresh (by design for security)
- User manually disconnects
- Session timeout

---

## 🎯 Next Steps

### Recommended

1. ✅ Add your Reown Project ID
2. ✅ Add merchant wallet address
3. ✅ Test with devnet first
4. ✅ Verify backend validates signatures
5. ✅ Switch to mainnet for production

### Optional Enhancements

- Add email notifications after purchase
- Show transaction history
- Add refund functionality
- Support multiple tokens (USDC, USDT, etc.)
- Add transaction status tracking
- Implement order confirmation page

---

## 📚 Resources

- **Reown Docs**: https://docs.reown.com/
- **Solana Docs**: https://docs.solana.com/
- **Wallet Adapters**: https://github.com/anza-xyz/wallet-adapter
- **Solana Devnet Faucet**: https://solfaucet.com/

---

## 🎉 You're All Set!

Users can now:
- ✅ Connect their Solana wallet
- ✅ Stay logged in across all pages
- ✅ Pay with crypto for game credits
- ✅ Get instant order confirmation

**Share your Reown Project ID and I'll help you configure it!**

---

## Quick Reference

```bash
# Install dependencies
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps

# Environment variables needed
NEXT_PUBLIC_REOWN_PROJECT_ID=...
NEXT_PUBLIC_MERCHANT_WALLET=...
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com

# Start development
npm run dev
```

**Wallet button location**: Top-right corner of every page!
