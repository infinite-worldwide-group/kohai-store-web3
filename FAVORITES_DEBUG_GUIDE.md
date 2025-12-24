# Favorites Feature Debug Guide

## Problem
The "Your Favourites" section is showing 0 products even though:
- Favorites are being stored to localStorage with wallet-specific keys
- The heart icon updates correctly when clicking
- The useFavorites hook is returning the favorites array

## Data Flow

```
User clicks heart icon on product card
    ↓
ListItem.tsx calls toggleFavorite(productId)
    ↓
useFavorites.ts: setFavorites updates state
    ↓
useFavorites.ts: useEffect saves to localStorage with wallet key
    ↓
useFavorites.ts: All hooks re-subscribe to new favorites array
    ↓
TopupProducts/index.tsx: favorites state updates
    ↓
TopupProducts passes favorites to CategoryDisplay as favouriteIds prop
    ↓
CategoryDisplay.tsx: useMemo recalculates categorizedData
    ↓
getCategorizedProducts() calls categorizeProduct() with favouriteIds
    ↓
categorizeProduct() calls isFavourite() to check if product is favorite
    ↓
If isFavourite returns true, product gets "favourite" category
    ↓
CategoryDisplay filters products by "favourite" category
    ↓
"Your Favourites" section displays matching products
```

## Enhanced Logging Points

We've added comprehensive console logging at every step. Here's what to watch for:

### Step 1: Heart Icon Click
**Expected Log:**
```
🔄 toggleFavorite called with: [productId]
❤️ Adding favorite: [productId] Total favorites now: [count]
```

### Step 2: Storage & Hook Updates
**Expected Logs:**
```
💾 Saving favorites to: topupProductFavorites_0x[walletAddress] [array]
📝 TopupProducts: favorites changed: [array] Count: [number]
```

### Step 3: Props Passed to CategoryDisplay
**Expected Logs:**
```
📊 TopupProducts - Current favorites: [array] Count: [number]
🎨 CategoryDisplay received props: {
  productsCount: [number],
  favouriteIds: [array],
  favouriteCount: [number]
}
```

### Step 4: Categorization
**Expected Logs:**
```
🔄 Recategorizing products with favouriteIds: [array] Products count: [number]
🔍 Categorizing product: {
  id: [productId],
  title: [title],
  favouriteIds: [array],
  isFav: [boolean]
}
❤️ isFavourite: Product [productId] is favourite
```

### Step 5: Results
**Expected Logs:**
```
✅ Categorized data result: {
  favourite: [count],
  popular: [count],
  newRelease: [count],
  trending: [count],
  all: [count],
  totalCategorized: [count],
  favouriteIds: [array],
  favouriteProducts: [{id, title}, ...]
}
```

## Debugging Steps

### 1. Open Browser Developer Tools
- **Windows/Linux**: `F12` or `Ctrl+Shift+I`
- **Mac**: `Cmd+Option+I`
- Go to **Console** tab

### 2. Test Adding a Favorite
1. Click the heart icon on any product card
2. Watch for logs from Step 1 above
3. Check if heart icon turns red (visual confirmation)

### 3. Check Browser LocalStorage
1. In DevTools, go to **Application** → **LocalStorage**
2. Find your domain (e.g., `localhost:3000`)
3. Look for keys starting with `topupProductFavorites_`
4. The key should contain your wallet address
5. The value should be a JSON array of product IDs: `["id1", "id2", ...]`

### 4. Trace the Complete Flow
1. Add a favorite → watch all logs from Steps 1-5 above
2. Look for any errors (red text) in console
3. Check if logs appear in this order:
   - `🔄 toggleFavorite`
   - `❤️ Adding favorite`
   - `💾 Saving favorites`
   - `📝 TopupProducts: favorites changed`
   - `📊 TopupProducts - Current favorites`
   - `🎨 CategoryDisplay received props`
   - `🔄 Recategorizing products`
   - `✅ Categorized data result`

### 5. Watch for These Red Flags

**If you see:**
```
⚠️ isFavourite: No favouriteIds provided for product: [id]
```
**Problem:** `favouriteIds` is undefined/null when reaching the categorization function
**Solution:** Check if props are being passed correctly from TopupProducts to CategoryDisplay

**If you see:**
```
⚠️ Wallet not connected, clearing favorites
```
**Problem:** Wallet is not connected when trying to load favorites
**Solution:** Make sure wallet is connected before adding favorites

**If you don't see any logs after adding a favorite:**
**Problem:** Event handler not being called
**Solution:** Check that click event is firing on heart button

### 6. Check Wallet Context

In DevTools Console, run:
```javascript
// Check if wallet context is working
localStorage.getItem('topupProductFavorites_0x...')
```

Replace `0x...` with your actual wallet address.

### 7. Test Specific Scenarios

**Scenario A: Same Wallet, Multiple Tabs**
1. Add a favorite in Tab 1
2. Check localStorage in Tab 2
3. The key should match wallet address from Tab 1

**Scenario B: Switch Wallets**
1. Add favorite with Wallet A
2. Disconnect and connect Wallet B
3. Favorites should be empty (new wallet)
4. LocalStorage should have separate keys for each wallet

**Scenario C: Page Reload**
1. Add favorite
2. Refresh the page (F5)
3. Favorites should persist (loaded from localStorage)
4. Check for "📂 Loading favorites from" log

## Common Issues & Fixes

### Issue: Heart icon works but "Your Favourites" section is empty

**Root Cause 1:** React memo not updating
- **Fix:** Check if CategoryDisplay dependencies include favouriteIds
- **Verify:** Look for `🔄 Recategorizing products` log after adding favorite

**Root Cause 2:** Product IDs don't match
- **Fix:** Verify the product.id used in ListItem matches the id in GraphQL response
- **Verify:** Compare logs showing product.id in categorization with stored IDs

**Root Cause 3:** Wallet address changes mid-render
- **Fix:** Ensure WalletContext is stable
- **Verify:** Check logs show same wallet address throughout

### Issue: Favorites not persisting after page reload

**Root Cause:** LocalStorage key mismatch
- **Fix:** Ensure wallet address is stable when building storage key
- **Verify:** Check localStorage in DevTools has correct keys

### Issue: Favorites work for one product but not others

**Root Cause:** Product data inconsistency
- **Fix:** Some products might not have `id` field set
- **Verify:** Check categorization logs for products with missing IDs

## Performance Considerations

The logging we've added is comprehensive for debugging but may impact performance. Once you've identified the issue, you can remove or reduce logging by:

1. Removing `console.log` statements from isFavourite() 
2. Reducing logs in useFavorites.ts
3. Keeping only the critical logs for ongoing debugging

## Next Steps

1. **Reproduce the issue** following the debugging steps above
2. **Capture all relevant console logs** (screenshot or copy-paste)
3. **Check localStorage** for the favorites key
4. **Report findings** including:
   - What logs appear (and in what order)
   - What logs are missing
   - Any error messages
   - Whether heart icon works correctly
   - Whether localStorage contains the data

Based on these findings, we can pinpoint exactly where the data flow is breaking.
