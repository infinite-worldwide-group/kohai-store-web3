# Favorites System Migration Guide

## Overview
Migrate from localStorage-based favorites to database-backed favorites for better reliability and cross-device sync.

---

## Current Status

✅ **Frontend GraphQL files created:**
- `graphql/mutations/AddFavorite.graphql`
- `graphql/mutations/RemoveFavorite.graphql`
- `graphql/queries/MyFavorites.graphql`
- `graphql/fragments/TopupProduct.graphql` (updated with `isFavorite` field)

✅ **New hook ready:**
- `src/hooks/useFavorites.backend.ts` (ready to use after backend is complete)

✅ **UI components updated:**
- Favorite button with error handling
- Wallet connection check
- Debounce protection

⏳ **Waiting for backend implementation**

---

## Migration Steps

### Step 1: Backend Implementation
**👉 Send `BACKEND_FAVORITES_IMPLEMENTATION.md` to your backend team**

They need to:
1. Create `user_favorites` database table
2. Add GraphQL mutations: `addFavorite`, `removeFavorite`
3. Add GraphQL query: `myFavorites`
4. Add `isFavorite` field to `TopupProduct` type
5. Deploy changes to production

**Estimated time:** 2-4 hours for backend team

---

### Step 2: Update GraphQL Schema (After Backend Deployed)

Once backend is live, update frontend schema:

```bash
npm run codegen
```

This will:
- ✅ Generate TypeScript types for new mutations
- ✅ Generate hooks: `useAddFavoriteMutation`, `useRemoveFavoriteMutation`, `useMyFavoritesQuery`
- ✅ Update `TopupProductFragment` to include `isFavorite`

**Expected:** No errors - all GraphQL queries should validate

---

### Step 3: Switch to Backend-Powered Hook

Replace the localStorage hook with the backend hook:

```bash
# Backup old hook (optional)
mv src/hooks/useFavorites.ts src/hooks/useFavorites.localStorage.ts

# Activate backend hook
mv src/hooks/useFavorites.backend.ts src/hooks/useFavorites.ts
```

**That's it!** No other code changes needed.

---

### Step 4: Update Categorization Logic

Update `src/utils/productCategorization.ts` to use backend `isFavorite`:

```typescript
// OLD (localStorage-based):
export const isFavourite = (product: any, favouriteIds?: string[]): boolean => {
  if (!favouriteIds) {
    return false;
  }
  return favouriteIds.includes(product.id);
};

// NEW (backend-based):
export const isFavourite = (product: any, favouriteIds?: string[]): boolean => {
  // Use the isFavorite field from backend
  return product.isFavorite || false;
};
```

Update `categorizeProduct`:

```typescript
export const categorizeProduct = (
  product: any,
  favouriteIds?: string[] // This parameter is now optional/unused
): CategorizedProduct => {
  let category: CategoryType = "others";

  // Use backend isFavorite field instead of checking array
  if (product.isFavorite) {
    category = "favourite";
  } else if (isPopular(product)) {
    category = "popular";
  } else if (isNewRelease(product)) {
    category = "new_release";
  } else if (isTrending(product)) {
    category = "trending";
  }

  return {
    product,
    categories: [category],
    platform: getPlatform(product),
  };
};
```

---

### Step 5: Testing Checklist

After migration, test:

- [ ] **Login with wallet** - Favorites should load from backend
- [ ] **Add favorite** - Click heart icon, check it persists after refresh
- [ ] **Remove favorite** - Click filled heart, check it's removed
- [ ] **Refresh page** - Favorites should still be there ✅ (This fixes the main issue!)
- [ ] **Different device** - Login on another device, favorites should sync ✅
- [ ] **Filter by "Favourite"** - Should show only favorited products
- [ ] **Platform counts** - Should show correct counts per platform
- [ ] **All category** - Should show all products in categorized view

---

## Benefits After Migration

| Feature | Before (localStorage) | After (Database) |
|---------|----------------------|------------------|
| **Persist on refresh** | ❌ Lost sometimes | ✅ Always persists |
| **Cross-device sync** | ❌ No | ✅ Yes |
| **Lost on cache clear** | ❌ Yes | ✅ No |
| **Requires wallet** | ✅ Yes | ✅ Yes |
| **Performance** | ⚡ Instant | ⚡ Fast (cached) |
| **Reliability** | ⚠️ Medium | ✅ High |

---

## Rollback Plan (If Issues)

If you encounter issues after migration:

```bash
# Switch back to localStorage version
mv src/hooks/useFavorites.ts src/hooks/useFavorites.backend.ts
mv src/hooks/useFavorites.localStorage.ts src/hooks/useFavorites.ts
```

Favorites will work again (localStorage-based).

---

## FAQs

### Q: Will users lose their existing favorites?
**A:** Yes, localStorage favorites won't automatically migrate. Users will need to re-favorite products. This is expected and unavoidable.

**Optional:** You could create a one-time migration script that reads localStorage and calls `addFavorite` mutation for each product.

### Q: What happens if backend is slow?
**A:** The hook uses optimistic updates - UI updates immediately while backend processes in background.

### Q: Do favorites work offline?
**A:** No, database favorites require internet. But they're cached, so previously loaded favorites will display.

### Q: Can I keep localStorage as backup?
**A:** Not recommended - it creates data inconsistency. Choose one source of truth (database is better).

---

## Timeline

1. **Week 1:** Backend team implements favorites API (2-4 hours)
2. **Week 1:** Deploy backend to staging/production
3. **Week 1:** Frontend team runs `npm run codegen` (2 minutes)
4. **Week 1:** Switch to backend hook (1 minute)
5. **Week 1:** Test thoroughly (30 minutes)
6. **Week 2:** Monitor for issues, users re-favorite products

**Total estimated time:** 1 week from start to finish

---

## Need Help?

1. Backend implementation questions → See `BACKEND_FAVORITES_IMPLEMENTATION.md`
2. Frontend issues → Check browser console for error messages
3. Testing → Use GraphQL playground to test mutations directly
