# Staking Feature Verification Checklist

## Server Status
✅ Dev server running on http://localhost:3002
✅ Staking page accessible at http://localhost:3002/staking
✅ No compilation errors

## What to Verify

### 1. Navigation
- [ ] Open http://localhost:3002
- [ ] Look for the blue "Stake" button in the header (desktop view)
- [ ] Click it - should navigate to /staking

### 2. Staking Page UI
- [ ] Visit http://localhost:3002/staking directly
- [ ] Should see "KOHAI Token Staking" header
- [ ] If wallet not connected:
  - [ ] Should show "Connect Your Wallet" message
  - [ ] Click "Connect Wallet" button

### 3. After Connecting Wallet
- [ ] Should see 4 stat cards:
  - Total Staked
  - Your Staked
  - Pending Rewards
  - APY
- [ ] Should see "Stake KOHAI" card on the left
- [ ] Should see "Unstake KOHAI" card on the right

### 4. Before Configuring (Expected Behavior)
Since you haven't set the `NEXT_PUBLIC_KOHAI_TOKEN_MINT` yet:
- [ ] Stats might show 0 or error (this is expected)
- [ ] Console might show errors about staking pool not found (expected)

## Required Configuration

### Step 1: Set KOHAI Token Mint
Edit your `.env.local` file and add:

```bash
NEXT_PUBLIC_KOHAI_TOKEN_MINT=YOUR_ACTUAL_KOHAI_MINT_ADDRESS
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

### Step 2: Restart Dev Server
After adding the environment variables:
```bash
# Kill current server (Ctrl+C in terminal)
# Or run: lsof -ti:3002 | xargs kill -9

# Restart
npm run dev
```

### Step 3: Initialize Staking Pool (If Not Done)
If the pool isn't initialized yet, you'll need to:
1. Use your authority wallet
2. Call `initialize_pool` instruction
3. Fund the reward vault

## Testing After Configuration

Once configured with correct KOHAI mint:
- [ ] Stats should load with real data
- [ ] Can enter amount in stake form
- [ ] Can attempt to stake (need KOHAI tokens)
- [ ] Unstake button should be disabled initially (no stake yet)
- [ ] Lock period should display correctly

## Common Issues

### Issue: "Staking pool not found"
**Solution**:
1. Check `NEXT_PUBLIC_KOHAI_TOKEN_MINT` is set correctly
2. Ensure pool is initialized on-chain
3. Verify you're on Solana Devnet

### Issue: Stats showing 0
**Solution**:
1. Pool might not be initialized
2. Check console for errors
3. Verify RPC endpoint is working

### Issue: Can't stake
**Solution**:
1. Ensure you have KOHAI tokens in your wallet
2. Check you have SOL for transaction fees
3. Verify wallet is connected to Devnet

## Development Tips

### View Console Logs
Open browser DevTools (F12) to see:
- Connection status
- API calls
- Error messages
- Transaction signatures

### Check Network
In browser DevTools > Network tab:
- Should see RPC calls to Solana
- Check for failed requests

### Verify Wallet Connection
In console, should see:
- "Connection State Change" logs
- Wallet address when connected

## Next Actions

1. **Get your KOHAI token mint address**
   - Check your token deployment
   - It's a Solana public key (base58 string)
   - Should be on Solana Devnet

2. **Update .env.local**
   - Add the mint address
   - Restart server

3. **Test the full flow**
   - Connect wallet
   - View stats
   - Try staking (if you have tokens)

## Support

If you encounter issues:
1. Check browser console for errors
2. Check terminal for server errors
3. Verify all environment variables
4. Ensure you're on the correct network (Devnet)

## Current Status

✅ Code implemented and compiled successfully
✅ Server running without errors
✅ Page accessible at /staking
⏳ Waiting for KOHAI token mint configuration
⏳ Waiting for pool initialization (if needed)

Ready to configure and test!
