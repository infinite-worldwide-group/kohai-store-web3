# Quick Favorites Debug Checklist

## 🔴 Current Issue
The "Your Favourites" section shows 0 products, but the heart icon works correctly.

## ✅ What We Know Works
- Heart icon updates when clicked (red/white toggle)
- Favorites are stored in localStorage
- The useFavorites hook is connected to the UI

## ❓ What Needs Fixing
- Favorites not showing in the "Your Favourites" category section

## 🔍 Quick Debug Checklist

### Step 1: Open DevTools Console (F12)
- [ ] Open VS Code terminal in browser
- [ ] Go to **Console** tab
- [ ] Look for any red error messages

### Step 2: Add a Favorite & Watch Console
- [ ] Click heart icon on a product card
- [ ] You should see logs like:
  - `🔄 toggleFavorite called with: [id]`
  - `❤️ Adding favorite: [id]`
  - `💾 Saving favorites to: topupProductFavorites_0x...`
  - `📝 TopupProducts: favorites changed: [...]`
  - `🎨 CategoryDisplay received props: { ... }`
  - `✅ Categorized data result: { favourite: X, ... }`

- [ ] Is the heart icon red after clicking? ✅ Good
- [ ] Do the logs appear in DevTools? ✅ Good
- [ ] Does the "Your Favourites" section show the product? ❓ **This is the issue**

### Step 3: Check LocalStorage
- [ ] Open DevTools → **Application** → **LocalStorage**
- [ ] Find your domain in the list
- [ ] Look for a key like `topupProductFavorites_0x1234...`
- [ ] You should see: `["product-id-1", "product-id-2"]`
- [ ] Is the key there with data? ✅ Good

### Step 4: Look for Missing Logs
Watch the console output for these logs when adding a favorite:

**MUST SEE:**
```
🔄 toggleFavorite called with: ...
❤️ Adding favorite: ...
```

**SHOULD SEE:**
```
🔄 Recategorizing products with favouriteIds: [...]
```

**MUST SEE:**
```
✅ Categorized data result: { favourite: X, ...
```

If `favourite: 0` in the result, the product wasn't recognized as a favorite.

### Step 5: Compare IDs
In the console logs, look for:
- The `productId` you clicked: `[id-from-heart-click]`
- The `favouriteIds` array passed to categorization: `[...]`
- Check if they match

If they don't match, that's the problem!

### Step 6: Check These Specific Logs

**After adding favorite, watch for:**

```javascript
// 1. Is favorites being saved?
💾 Saving favorites to: topupProductFavorites_0x... 
// Check the array in this log

// 2. Is TopupProducts getting the updated favorites?
📝 TopupProducts: favorites changed: [...]
// Should show the product ID you just added

// 3. Is CategoryDisplay receiving them?
🎨 CategoryDisplay received props: { ..., favouriteIds: [...], ... }
// Should show the product ID in favouriteIds array

// 4. Is categorization recognizing it?
✅ Categorized data result: { favourite: 1, ...
// Should show favourite: 1 instead of favourite: 0
```

## 🚀 If You Find the Issue

**Issue: favouriteIds is empty in CategoryDisplay**
- The prop isn't being passed correctly from TopupProducts
- Check: TopupProducts passes `favouriteIds={favorites}`

**Issue: favouriteIds has data but "favourite" count is still 0**
- The product.id doesn't match what's in favouriteIds
- Check: Product IDs in favorites storage vs GraphQL response

**Issue: No logs appear after clicking heart**
- The click handler isn't firing
- Check: Heart button click event is properly bound

**Issue: "Your Favourites" shows 0 even with logs saying favourite: 1**
- CategorySection might be filtering it out
- Check: CategorySection component is rendering correctly

## 📝 Report Back With

When you've debugged, collect:
1. Screenshot or copy of the console logs
2. What the localStorage shows (DevTools → Application → LocalStorage)
3. Whether heart icon works
4. Whether logs say `favourite: 0` or `favourite: X` (where X > 0)
5. Any error messages (red text in console)

This will help identify exactly where the break is!
