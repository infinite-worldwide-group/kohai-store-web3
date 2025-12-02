# 🔧 Payment Troubleshooting Guide

## Error: "Payment failed. Please try again."

This error usually happens for one of these reasons:

---

## ✅ Solution 1: Add Merchant Wallet Address (Most Common)

### The Issue:
Your `.env.local` file has this:
```env
NEXT_PUBLIC_MERCHANT_WALLET=
```

It's empty! The payment system doesn't know where to send the funds.

### The Fix:

1. **Get your Solana wallet address:**
   - Open Phantom wallet (or install from https://phantom.app/)
   - Click your wallet name at the top
   - Click "Copy Address"
   - You'll get something like: `7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU`

2. **Add it to `.env.local`:**
   ```env
   NEXT_PUBLIC_MERCHANT_WALLET=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
   ```
   (Replace with YOUR actual wallet address)

3. **Restart the dev server:**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

4. **Try payment again!**

---

## ✅ Solution 2: Use Demo Mode (For Testing)

Don't have SOL or want to test without blockchain?

**Just click the "🧪 Simulate Payment (Demo Mode)" button instead!**

This will:
- ✅ Generate a fake transaction signature
- ✅ Let you test the order flow
- ✅ No blockchain or real money needed

---

## ✅ Solution 3: Check Your Balance

### Devnet (Testing):
1. Make sure your wallet is on **Devnet** network
2. Get free test SOL: https://solfaucet.com/
3. Paste your wallet address
4. Get 1-2 SOL for testing

### Mainnet (Production):
1. Make sure you have enough SOL
2. Need at least: Transaction amount + ~0.000005 SOL (gas fee)

---

## 🔍 How to Debug

### Step 1: Open Browser Console
- **Chrome/Edge**: Press `F12` or right-click → Inspect → Console
- **Safari**: Develop → Show Web Inspector → Console
- **Firefox**: Press `F12` → Console

### Step 2: Try Payment Again
Look for these messages:

**✅ Good (Merchant configured):**
```
Sending transaction: { merchantAddress: "7xKXtg...", price: 0.01, from: "..." }
Transaction successful: abc123...
```

**❌ Bad (Merchant not configured):**
```
Merchant wallet not configured.
Please add NEXT_PUBLIC_MERCHANT_WALLET to .env.local
```

**❌ Bad (Insufficient balance):**
```
Payment error: Insufficient funds
```

### Step 3: Fix Based on Error

**If you see "Merchant wallet not configured":**
→ Follow Solution 1 above

**If you see "Insufficient funds":**
→ Get more SOL (devnet: https://solfaucet.com/)

**If you see wallet errors:**
→ Make sure wallet is connected and on correct network

---

## 📋 Checklist

Before trying real payment:

- [ ] `.env.local` has `NEXT_PUBLIC_MERCHANT_WALLET=YourActualAddress`
- [ ] Dev server restarted after adding address
- [ ] Wallet is connected (see top-right corner)
- [ ] Wallet is on Devnet network (for testing)
- [ ] You have at least 0.1 SOL in wallet
- [ ] Browser console is open to see errors

---

## 🎯 Quick Test (No Setup Needed)

Just click **"🧪 Simulate Payment (Demo Mode)"** and you'll see:

```
✓ Payment Successful!
  Transaction signature captured
  sim_1234567890_abc123

✓ Now click "Create Order" below to complete your purchase
```

This proves the order creation works, even without blockchain setup!

---

## 🔧 Common Errors & Solutions

### Error: "Merchant wallet not configured"
**Solution:** Add your wallet address to `.env.local` and restart server

### Error: "Insufficient funds"
**Solution:** Get SOL from faucet (https://solfaucet.com/)

### Error: "Transaction timeout"
**Solution:** Network congestion, try again or use different RPC endpoint

### Error: "User rejected"
**Solution:** User cancelled in wallet - this is normal, just try again

### Wallet doesn't prompt for approval
**Solution:**
1. Make sure wallet extension is unlocked
2. Try disconnecting and reconnecting wallet
3. Refresh page

---

## 💡 Pro Tips

### For Development:
- Use **Devnet** network
- Get free SOL from faucet
- Use small amounts (0.01 SOL)
- Use Demo Mode for quick testing

### For Production:
- Switch to **Mainnet** network
- Update `.env.local`:
  ```env
  NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
  ```
- Update `src/lib/reown-config.ts` line 61:
  ```typescript
  export const defaultNetwork = solana; // not solanaDevnet
  ```

---

## 📞 Still Having Issues?

1. **Check browser console** for error messages
2. **Verify wallet is connected** (green dot in top-right)
3. **Try demo mode first** to isolate the issue
4. **Check your `.env.local`** file has all required variables

### Your `.env.local` should look like:
```env
NEXT_PUBLIC_STORE_ID=8
NEXT_PUBLIC_DOMAIN=http://localhost:3002/
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3000/graphql
NEXT_PUBLIC_STORE_NAME="Kohai Game Credit"

# Reown Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=3640df604b8bb5d05ba846326433772c

# Solana Configuration
NEXT_PUBLIC_MERCHANT_WALLET=YourWalletAddressHere  ← Add this!
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

---

## ✅ Success Looks Like This:

When payment works correctly, you'll see:

1. Click "Pay 0.1 SOL"
2. Wallet opens asking for approval
3. Click "Approve"
4. Green success message appears:
   ```
   ✓ Payment Successful!
     Transaction signature captured
     abc123def456...xyz789

   ✓ Now click "Create Order" below
   ```
5. Click "Create Order"
6. Order created with blockchain proof! 🎉

---

**For quick testing without setup: Use "Simulate Payment (Demo Mode)"!** 🧪
