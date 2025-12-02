# 🚀 Quick Setup - Ready to Launch!

## ✅ Your Reown Project ID is Configured!

**Project ID:** `3640df604b8bb5d05ba846326433772c`

Everything is set up! Just follow these 3 simple steps:

---

## Step 1: Install Dependencies (2 minutes)

Run this command:

```bash
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps
```

**If you get permission errors**, run this first:
```bash
sudo chown -R $(whoami) "/Users/$(whoami)/.npm"
```

Then try the install command again.

---

## Step 2: Add Your Merchant Wallet Address

Edit `.env.local` and add your Solana wallet address on line 17:

```env
NEXT_PUBLIC_MERCHANT_WALLET=YourSolanaWalletAddressHere
```

**Where to get your wallet address:**
- Open Phantom wallet (or any Solana wallet)
- Click on your wallet name at the top
- Copy your wallet address
- Paste it in `.env.local`

**Don't have a Solana wallet yet?**
- Install Phantom: https://phantom.app/
- Create a new wallet
- Save your recovery phrase securely
- Copy your wallet address

---

## Step 3: Start the Dev Server

```bash
npm run dev
```

Visit: **http://localhost:3006**

**Look at the top-right corner** → You'll see the **"Connect Wallet"** button! 🎉

---

## 🎯 What You'll See

### Top-Right of Every Page:
```
[Logo]                              [Connect Wallet] 👈
```

### Click "Connect Wallet":
1. Reown modal opens
2. Select your wallet (Phantom, Solflare, etc.)
3. Approve connection in wallet
4. Button changes to show your address: `0x1234...5678`

### On Product Pages:
1. Select a package
2. See "Pay with Wallet" section
3. Click "Pay [amount] SOL"
4. Approve payment in wallet
5. Transaction signature auto-filled
6. Click "Create Order"
7. Done! 🎊

---

## 🧪 Testing Without Real Crypto

Don't want to use real crypto yet? Use **Demo Mode**:

1. On the purchase form, scroll to "Payment with Wallet"
2. Click **"🧪 Simulate Payment (Demo Mode)"**
3. A fake transaction signature is generated
4. Test the order creation without blockchain

---

## ⚙️ Configuration Summary

Your `.env.local` now has:

```env
# ✅ Reown Project ID (configured!)
NEXT_PUBLIC_REOWN_PROJECT_ID=3640df604b8bb5d05ba846326433772c

# ⚠️ Add your wallet address here
NEXT_PUBLIC_MERCHANT_WALLET=

# ✅ Using Solana Devnet for testing
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

---

## 💡 Important Notes

### For Testing (Current Setup):
- Using **Solana Devnet** (test network)
- Get free test SOL: https://solfaucet.com/
- No real money involved
- Safe to experiment

### For Production:
Edit `.env.local` and change:
```env
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

Also update `src/lib/reown-config.ts` line 61:
```typescript
export const defaultNetwork = solana; // Change from solanaDevnet
```

---

## 🔍 Troubleshooting

### Wallet button not showing?
1. Check dependencies installed: `npm list @reown/appkit`
2. Restart dev server: `npm run dev`
3. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### "Project ID not set" warning?
- Check `.env.local` has: `NEXT_PUBLIC_REOWN_PROJECT_ID=3640df604b8bb5d05ba846326433772c`
- Restart dev server

### Transaction fails?
- Make sure you're using Devnet
- Get free SOL: https://solfaucet.com/
- Check wallet is connected to Devnet network

---

## 📱 Mobile Wallets Work Too!

On mobile devices:
1. Click "Connect Wallet"
2. Select your mobile wallet
3. QR code appears (or deep link)
4. Scan with mobile wallet app
5. Approve connection
6. Connected! Works seamlessly on mobile

---

## 🎉 You're All Set!

After Step 3, your store will have:

✅ **Wallet button** in top-right corner (all pages)
✅ **Connect/disconnect** functionality
✅ **Balance display** when connected
✅ **Pay with crypto** on product pages
✅ **Auto-capture** transaction signatures
✅ **Create orders** with blockchain proof

---

## Quick Commands Reference

```bash
# Install dependencies
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps

# Start development
npm run dev

# Get free test SOL (for testing)
# Visit: https://solfaucet.com/
```

---

## 🚀 Ready? Let's Go!

**Run these 3 commands:**

```bash
# 1. Install
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps

# 2. Add your wallet address to .env.local (edit the file)

# 3. Start
npm run dev
```

**Then look at the top-right corner of your store!** 👀

---

## Need Help?

- Reown Dashboard: https://cloud.reown.com/
- Your Project: https://cloud.reown.com/app/project?projectId=3640df604b8bb5d05ba846326433772c
- Solana Devnet Faucet: https://solfaucet.com/
- Phantom Wallet: https://phantom.app/

**Your project is ready to accept crypto payments!** 🎊
