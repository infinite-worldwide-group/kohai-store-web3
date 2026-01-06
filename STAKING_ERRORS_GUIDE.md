# KOHAI Staking - Error Guide

## Common Errors and Solutions

### Error: "Staking pool not found. Please initialize the pool first."

**What it means**: The staking pool account doesn't exist on-chain yet.

**Solution**:
1. You need to initialize the pool using the authority wallet
2. Run the Anchor program's `initialize_pool` instruction
3. Command (if using Anchor CLI):
   ```bash
   anchor run initialize-pool --provider.cluster devnet
   ```

**To verify**:
```bash
solana account 3eQnPudPXBuXMwgwY1U2VK5Fc8jdji5s9dDttg1bvCuN --url devnet
```

---

### Error: "You don't have a KOHAI token account. Please get some KOHAI tokens first."

**What it means**: Your wallet doesn't have an associated token account for KOHAI tokens.

**Solution**:
1. You need to receive KOHAI tokens first
2. Once you receive tokens, the account will be created automatically
3. Alternative: Create the account manually using SPL Token CLI

**To get KOHAI tokens**:
- Ask the token issuer to send you some KOHAI tokens on Devnet
- Or mint tokens if you have mint authority

---

### Error: "Insufficient balance. You have X KOHAI but trying to stake Y KOHAI."

**What it means**: You don't have enough KOHAI tokens in your wallet.

**Solution**:
1. Check your actual balance
2. Only stake what you have
3. Get more KOHAI tokens if needed

**Example**: If you have 5 KOHAI, you can only stake up to 5 KOHAI.

---

### Error: "KOHAI token account not found. Please ensure you have KOHAI tokens in your wallet."

**What it means**: Your wallet is connected but you don't have any KOHAI tokens.

**Solution**:
1. Get KOHAI tokens sent to your wallet address
2. Make sure you're on the correct network (Devnet)
3. Verify the token mint address is correct

---

### Error: "Wallet not connected"

**What it means**: No wallet is connected to the app.

**Solution**:
1. Click the "Connect Wallet" button
2. Choose your wallet (Phantom, Solflare, etc.)
3. Approve the connection
4. Make sure your wallet is on Devnet

---

### Error: "Internal JSON-RPC error"

**What it means**: Generic error from the Solana RPC. Could be many things.

**Common causes**:
1. Pool not initialized
2. Invalid account states
3. Network issues
4. Transaction simulation failed

**Solutions**:
- Check browser console for detailed error logs
- Look for the specific error in the console
- The new error handling should show more specific messages

---

## Pre-Flight Checklist

Before staking, ensure:

- [ ] **Wallet connected** to the app
- [ ] **Network is Devnet** (not Mainnet)
- [ ] **Have SOL on Devnet** (for transaction fees) - Get from https://faucet.solana.com/
- [ ] **Have KOHAI tokens** in your wallet
- [ ] **Staking pool is initialized** on-chain
- [ ] **Know your token balance** (check in wallet)

## Checking Your Setup

### 1. Check Wallet Connection
Open browser console (F12) and look for:
```
🔍 Connection State Change: { isConnected: true, address: "YOUR_ADDRESS" }
```

### 2. Check Network
In your wallet:
- Should show "Devnet" network
- Not "Mainnet Beta"

### 3. Check KOHAI Balance
In your wallet or on staking page:
- Should see your KOHAI balance
- If 0, you need to get KOHAI tokens

### 4. Check Pool Status
Browser console should show staking pool data when page loads.
If you see errors about "account not found", pool isn't initialized.

## Getting Help

### Browser Console Logs
The improved error handling now logs:
- Transaction details before sending
- Specific error messages
- Account states

**To view**:
1. Press F12 to open DevTools
2. Go to Console tab
3. Try the operation again
4. Look for error messages in red

### What to Check
1. **Network**: Make sure wallet is on Devnet
2. **Balance**: Check you have KOHAI tokens
3. **SOL**: Need SOL for transaction fees (0.00001-0.001 SOL usually)
4. **Pool**: Verify pool is initialized

### Example Error Flow

**Old error**:
```
Internal JSON-RPC error
```

**New error** (more helpful):
```
Insufficient balance. You have 0 KOHAI but trying to stake 1 KOHAI.
```

This tells you exactly what's wrong!

## Initialization Guide

If you need to initialize the staking pool:

### Requirements
- Authority wallet (the one that deployed the program)
- Some SOL for transaction fees
- KOHAI token mint address

### Steps
1. Have your Anchor workspace ready
2. Run initialization instruction:
   ```typescript
   await program.methods
     .initializePool(new BN(totalRewardAmount))
     .accounts({
       stakingPool: stakingPoolPda,
       authority: authorityWallet.publicKey,
       tokenMint: kohaiMintAddress,
       rewardVault: rewardVaultPda,
       stakeVault: stakeVaultPda,
       tokenProgram: TOKEN_PROGRAM_ID,
       systemProgram: SystemProgram.programId,
       rent: SYSVAR_RENT_PUBKEY,
     })
     .rpc();
   ```

3. Fund the reward vault:
   ```typescript
   await program.methods
     .fundRewards(new BN(rewardAmount))
     .accounts({
       stakingPool: stakingPoolPda,
       authority: authorityWallet.publicKey,
       authorityTokenAccount: authorityKohaiAccount,
       rewardVault: rewardVaultPda,
       tokenProgram: TOKEN_PROGRAM_ID,
     })
     .rpc();
   ```

## Testing Tips

### Start Small
1. Try staking just 0.1 KOHAI first
2. Verify it works
3. Then stake larger amounts

### Monitor Transactions
- Watch Solana Explorer for your transactions
- URL: https://explorer.solana.com/address/YOUR_WALLET?cluster=devnet

### Check Logs
- Keep browser console open
- Watch for the new detailed error messages
- They'll tell you exactly what's wrong

## Summary

The improved error handling now gives you:
- ✅ Specific error messages
- ✅ Balance checks before transaction
- ✅ Pool existence verification
- ✅ Token account validation
- ✅ Detailed console logs

If you still get an error, check the browser console for the detailed message!
