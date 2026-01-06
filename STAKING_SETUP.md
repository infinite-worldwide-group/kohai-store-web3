# KOHAI Token Staking Setup Guide

This guide explains how to configure and use the KOHAI token staking feature.

## Overview

The staking feature allows users to:
- Stake KOHAI tokens to earn rewards
- Unstake tokens after the lock period
- Claim accumulated rewards
- View staking statistics and APY

## Program Details

- **Program ID**: `Bmtrb34ikPyAwdsobDBpiJWhRjh5adZWaRQ8kV9qDJ3d`
- **Network**: Solana Devnet
- **Explorer**: https://explorer.solana.com/address/Bmtrb34ikPyAwdsobDBpiJWhRjh5adZWaRQ8kV9qDJ3d?cluster=devnet

## Configuration

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_KOHAI_TOKEN_MINT=YOUR_KOHAI_TOKEN_MINT_ADDRESS
```

**Important**: Replace `YOUR_KOHAI_TOKEN_MINT_ADDRESS` with your actual KOHAI token mint address.

### 2. Update Config File

If needed, you can also update the configuration in:
`src/lib/staking/config.ts`

```typescript
export const KOHAI_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_KOHAI_TOKEN_MINT || "YOUR_MINT_ADDRESS"
);
```

## Files Created

### Core Files
- `src/lib/idl/kohai_staking.json` - Anchor program IDL
- `src/lib/staking/types.ts` - TypeScript types for staking
- `src/lib/staking/config.ts` - Staking configuration
- `src/lib/staking/client.ts` - Staking client for blockchain interactions

### React Integration
- `src/hooks/useStaking.ts` - React hook for staking operations
- `src/app/staking/page.tsx` - Staking page UI

### Navigation
- Updated `src/components/User/Header/index.tsx` - Added "Stake" button

## Features

### Staking Operations

#### 1. Stake Tokens
- Enter amount to stake
- Click "Stake" button
- Approve transaction in wallet
- Tokens are locked for the configured lock period

#### 2. Unstake Tokens
- Wait for lock period to expire
- Enter amount to unstake
- Click "Unstake" button
- Receive tokens back to wallet

#### 3. Claim Rewards
- View pending rewards in the stats
- Click "Claim Rewards" button
- Receive reward tokens to wallet

### Statistics Displayed

- **Total Staked**: Total KOHAI tokens staked in the pool
- **Your Staked**: Your personal stake amount
- **Pending Rewards**: Rewards ready to claim
- **APY**: Annual Percentage Yield

## User Interface

### Accessing the Staking Page

1. Navigate to `/staking` or click the "Stake" button in the header
2. Connect your wallet if not already connected
3. View your staking statistics
4. Perform staking operations

### UI Components

- **Stats Grid**: Displays key metrics
- **Stake Card**: Input amount and stake tokens
- **Unstake Card**: Input amount and unstake tokens (shows lock timer)
- **Claim Rewards Card**: Appears when rewards > 0

## Technical Details

### Account Structure

#### StakingPool
- `authority`: Pool authority address
- `token_mint`: KOHAI token mint
- `reward_vault`: Vault holding reward tokens
- `stake_vault`: Vault holding staked tokens
- `total_reward_amount`: Total rewards allocated
- `total_staked`: Total tokens currently staked
- `start_time`: Staking period start
- `end_time`: Staking period end
- `lock_period_seconds`: Lock duration

#### UserStake
- `owner`: Staker's wallet address
- `staking_pool`: Reference to staking pool
- `amount`: Amount staked
- `reward_debt`: Rewards already claimed
- `stake_timestamp`: When tokens were staked
- `last_claim_timestamp`: Last reward claim time

### Program Errors

- **InvalidAmount**: Stake/unstake amount is invalid
- **StakingEnded**: Staking period has ended
- **InsufficientStake**: Not enough tokens staked
- **StillLocked**: Lock period hasn't expired
- **NoRewardsToClaim**: No rewards available

## Development

### Install Dependencies

```bash
npm install @coral-xyz/anchor @solana/web3.js bn.js
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3002/staking`

### Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Wallet Not Connecting
- Ensure you have a Solana wallet installed (Phantom, Solflare, etc.)
- Check that you're on the correct network (Devnet)
- Try refreshing the page

### Transaction Failing
- Check you have enough SOL for transaction fees
- Verify you have enough KOHAI tokens to stake
- Ensure lock period has expired before unstaking

### Stats Not Loading
- Verify `NEXT_PUBLIC_KOHAI_TOKEN_MINT` is set correctly
- Check RPC endpoint is accessible
- Ensure staking pool is initialized on-chain

## Security Notes

- Always verify transaction details before signing
- Only stake tokens you can afford to lock for the lock period
- Keep your wallet seed phrase secure
- This is deployed on Devnet - use only for testing

## Support

For issues or questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure you're connected to the correct network
4. Check the program on Solana Explorer

## Next Steps

To initialize the staking pool (requires authority):
1. Update the token mint address in config
2. Call `initialize_pool` instruction with total reward amount
3. Fund the reward vault using `fund_rewards`
4. Users can then start staking

## License

This implementation uses Anchor framework and Solana web3.js for blockchain interactions.
