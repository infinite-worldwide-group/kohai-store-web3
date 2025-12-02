# Reown (WalletConnect) Integration Guide

## Step 1: Install Dependencies

Run this command to install Reown and Solana wallet support:

```bash
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps
```

If you encounter permission issues, run:
```bash
sudo chown -R $(whoami) "/Users/$(whoami)/.npm"
npm install @reown/appkit @reown/appkit-adapter-solana @solana/web3.js --legacy-peer-deps
```

## Step 2: Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Add your Reown Project ID to `.env.local`:
```env
NEXT_PUBLIC_REOWN_PROJECT_ID=your_actual_project_id_here
```

**Where to get your Project ID:**
- Go to https://cloud.reown.com/
- Sign in or create an account
- Create a new project or use existing one
- Copy the Project ID

## Step 3: Integration Files

I'll create the following files for you:

1. `src/lib/reown-config.ts` - Reown configuration
2. `src/contexts/WalletContext.tsx` - Wallet provider context
3. `src/components/WalletConnect/WalletButton.tsx` - Connect wallet button
4. Updated `PurchaseForm.tsx` - Integrated with wallet

## Step 4: Update Root Layout

Add the wallet provider to your app (I'll show you how after creating the files).

## Features You'll Get

✅ **Wallet Connection**
- Connect with any Solana wallet (Phantom, Solflare, etc.)
- WalletConnect v2 support for mobile wallets
- Beautiful modal UI from Reown

✅ **Authentication**
- Sign messages with wallet
- Verify wallet ownership
- Authenticate users via wallet signature

✅ **Payment Integration**
- Request payments from connected wallet
- Sign transactions
- Automatic transaction signature capture
- Integration with `createOrder` mutation

✅ **User Experience**
- "Connect Wallet" button
- Wallet address display
- Disconnect functionality
- Network indicator (Mainnet/Devnet)
- Transaction status updates

## Ready to Proceed?

Please share your Reown Project ID, and I'll create all the integration files customized with your project ID!

Example format:
```
REOWN_PROJECT_ID=abc123def456...
```
