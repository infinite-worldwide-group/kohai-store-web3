# KOHAI Staking - Quick Start

## What Was Created

Your KOHAI token staking page is now ready! Here's what was added:

### 1. Core Staking Files
- ✅ `src/lib/idl/kohai_staking.json` - Program interface
- ✅ `src/lib/staking/types.ts` - TypeScript types
- ✅ `src/lib/staking/config.ts` - Configuration
- ✅ `src/lib/staking/client.ts` - Blockchain client
- ✅ `src/hooks/useStaking.ts` - React hook
- ✅ `src/app/staking/page.tsx` - Staking page UI

### 2. Navigation
- ✅ Added "Stake" button to the header (visible on desktop)
- ✅ Route: `/staking`

## Next Steps

### Step 1: Configure Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_KOHAI_TOKEN_MINT=YOUR_ACTUAL_KOHAI_MINT_ADDRESS
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

**IMPORTANT**: You must replace `YOUR_ACTUAL_KOHAI_MINT_ADDRESS` with your KOHAI token's mint address on Solana Devnet.

### Step 2: Initialize the Staking Pool (Admin Only)

If you haven't initialized the pool yet, you'll need to:

1. Have the authority wallet that can create the pool
2. Call the `initialize_pool` instruction with your KOHAI token mint
3. Fund the reward vault using `fund_rewards`

### Step 3: Start the Dev Server

```bash
npm run dev
```

Visit: `http://localhost:3002/staking`

## Features Available

### For Users
- **Stake KOHAI tokens**: Lock tokens to earn rewards
- **Unstake tokens**: Withdraw after lock period expires
- **Claim rewards**: Collect earned rewards anytime
- **View statistics**: See APY, total staked, your stake, pending rewards

### UI Components
- Stats dashboard showing pool metrics
- Stake/Unstake forms with amount inputs
- Lock period countdown timer
- Reward claiming interface
- Transaction success/error notifications

## How It Works

1. **Connect Wallet**: Users click "Connect Wallet" or "Stake" button
2. **View Stats**: See total staked, APY, and their current stake
3. **Stake**: Enter amount and confirm transaction
4. **Wait for Lock Period**: Tokens are locked for the configured duration
5. **Claim Rewards**: Claim accumulated rewards anytime
6. **Unstake**: After lock period, unstake tokens back to wallet

## Program Details

- **Program ID**: `Bmtrb34ikPyAwdsobDBpiJWhRjh5adZWaRQ8kV9qDJ3d`
- **Network**: Solana Devnet
- **Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/Bmtrb34ikPyAwdsobDBpiJWhRjh5adZWaRQ8kV9qDJ3d?cluster=devnet)

## Testing Checklist

- [ ] Set `NEXT_PUBLIC_KOHAI_TOKEN_MINT` in `.env.local`
- [ ] Initialize staking pool (if not done)
- [ ] Fund reward vault
- [ ] Connect wallet on `/staking` page
- [ ] Check if stats load correctly
- [ ] Test staking tokens
- [ ] Test claiming rewards
- [ ] Test unstaking after lock period

## Troubleshooting

### "Staking pool not found" error
- Ensure the pool is initialized on-chain
- Verify `NEXT_PUBLIC_KOHAI_TOKEN_MINT` is correct

### "Wallet not connected" error
- Click the wallet button to connect
- Make sure you're on Solana Devnet

### Transaction failures
- Check you have SOL for transaction fees
- Verify you have KOHAI tokens in your wallet
- Ensure you're connected to the correct network

## Support Files

- `STAKING_SETUP.md` - Detailed technical documentation
- `.env.local.example` - Updated with staking config

## Architecture

```
User Wallet
    ↓
useStaking Hook (React)
    ↓
StakingClient (Anchor)
    ↓
On-chain Program (Bmtrb34...)
    ↓
StakingPool & UserStake Accounts
```

The implementation uses:
- **Anchor Framework** for program interaction
- **@solana/web3.js** for blockchain operations
- **React hooks** for state management
- **Tailwind CSS** for styling

Ready to go! Just add your KOHAI token mint address and you're all set.
