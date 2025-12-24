# Favorites Data Flow Diagram

## Complete Data Flow with Logging Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    USER CLICKS HEART ICON ON PRODUCT                   │
│                                                                         │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ListItem.tsx                                                            │
│ - onClick fires toggleFavorite(productId)                              │
│ - Heart icon turns red ✓                                               │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useFavorites Hook - toggleFavorite()                                    │
│                                                                         │
│ 🔄 toggleFavorite called with: [productId]                            │
│ ❤️ Adding favorite: [productId] Total favorites now: X                 │
│ (OR)                                                                    │
│ ❌ Removing favorite: [productId]                                       │
│                                                                         │
│ ACTION: setFavorites(prev => [...prev, productId])                     │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useFavorites Hook - useEffect (Save to localStorage)                   │
│                                                                         │
│ 💾 Saving favorites to: topupProductFavorites_0x[wallet] [...]        │
│                                                                         │
│ ACTION: localStorage.setItem(storageKey, JSON.stringify(favorites))    │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ React Re-render - All Hooks Using useFavorites                         │
│                                                                         │
│ useFavorites Hook triggers update                                       │
│ ↓                                                                       │
│ setFavorites([...updated array...])                                    │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ListItem.tsx - Re-renders                                              │
│                                                                         │
│ const isProductFavorite = isFavorite(productId)                        │
│ ✅ Product [productId] is in favorites                                 │
│                                                                         │
│ Heart icon now shows as red ✓✓✓                                       │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ TopupProducts.tsx - Re-renders                                         │
│                                                                         │
│ const { favorites } = useFavorites()                                   │
│                                                                         │
│ 📝 TopupProducts: favorites changed: [...] Count: X                    │
│ 📊 TopupProducts - Current favorites: [...] Count: X                   │
│                                                                         │
│ ACTION: Pass favorites to CategoryDisplay as favouriteIds prop         │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CategoryDisplay.tsx - Receives Props                                    │
│                                                                         │
│ 🎨 CategoryDisplay received props: {                                   │
│   productsCount: 523,                                                   │
│   favouriteIds: [...],          ← THIS IS KEY!                         │
│   favouriteCount: X,                                                    │
│   loading: false                                                        │
│ }                                                                       │
│                                                                         │
│ ACTION: useMemo triggers because favouriteIds changed                  │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ getCategorizedProducts(products, favouriteIds)                         │
│                                                                         │
│ 🔄 Recategorizing products with favouriteIds: [...] Products: 523     │
│                                                                         │
│ ACTION: Map each product through categorizeProduct()                   │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ For Each Product: categorizeProduct(product, favouriteIds)             │
│                                                                         │
│ 🔍 Categorizing product: {                                             │
│   id: [productId],                                                      │
│   title: [title],                                                       │
│   favouriteIds: [...],                                                  │
│   isFav: ?                                                              │
│ }                                                                       │
│                                                                         │
│ ACTION: Call isFavourite(product, favouriteIds)                        │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ isFavourite(product, favouriteIds)                                     │
│                                                                         │
│ ✅ IF product.id in favouriteIds:                                      │
│    ❤️ isFavourite: Product [id] is favourite                          │
│    RETURN true                                                          │
│                                                                         │
│ ❌ IF product.id NOT in favouriteIds:                                  │
│    RETURN false                                                         │
│                                                                         │
│ ⚠️ IF favouriteIds is undefined:                                       │
│    ⚠️ isFavourite: No favouriteIds provided                           │
│    RETURN false                                                         │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ categorizeProduct() - Continues                                        │
│                                                                         │
│ IF isFavourite returned true:                                           │
│   categories.push("favourite")      ← PRODUCT MARKED AS FAVOURITE!    │
│ IF isPopular():                                                         │
│   categories.push("popular")                                            │
│ IF isTrending():                                                        │
│   categories.push("trending")                                           │
│ IF isNewRelease():                                                      │
│   categories.push("new_release")                                        │
│                                                                         │
│ ACTION: Return { product, categories, platform }                       │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CategoryDisplay - Back in useMemo                                       │
│                                                                         │
│ result = {                                                              │
│   favourite: categorized.filter(p =>                                   │
│              p.categories.includes("favourite"))                       │
│   popular: [...],                                                       │
│   new_release: [...],                                                   │
│   trending: [...],                                                      │
│   all: [...]                                                            │
│ }                                                                       │
│                                                                         │
│ ✅ Categorized data result: {                                          │
│   favourite: X,        ← THIS SHOULD BE > 0!                          │
│   popular: 45,                                                          │
│   newRelease: 23,                                                       │
│   trending: 12,                                                         │
│   all: 523,                                                             │
│   favouriteProducts: [{id, title}, ...]                                │
│ }                                                                       │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CategoryDisplay - Renders CategorySections                             │
│                                                                         │
│ IF categorizedData.favourite.length > 0:                               │
│   <CategorySection                                                      │
│     title="❤️ Your Favourites"                                         │
│     products={categorizedData.favourite}                               │
│   />                                                                    │
│ ELSE:                                                                   │
│   (Don't render section)                                                │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CategorySection - Renders Products                                     │
│                                                                         │
│ IF products.length === 0:                                               │
│   Return null (Section hidden)                                          │
│ ELSE:                                                                   │
│   Render section with products                                          │
│   Display: "❤️ Your Favourites"                                        │
│   Show: [X products]                                                    │
│   Products: Grid or horizontal scroll                                   │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│        "YOUR FAVOURITES" SECTION APPEARS WITH PRODUCT!  ✨            │
│                                                                         │
│              🎉 SUCCESS 🎉                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Logging Points Summary

| Step | Log | What It Tells You |
|------|-----|-------------------|
| 1 | `🔄 toggleFavorite called` | Click was registered |
| 2 | `❤️ Adding favorite` | State is being updated |
| 3 | `💾 Saving favorites` | Data is going to storage |
| 4 | `📝 TopupProducts: favorites changed` | Component received update |
| 5 | `📊 TopupProducts - Current favorites` | Favorites before passing to child |
| 6 | `🎨 CategoryDisplay received props` | Props delivered correctly |
| 7 | `🔄 Recategorizing products` | Categorization starting |
| 8 | `❤️ isFavourite: Product X is favourite` | Product recognized as favorite |
| 9 | `✅ Categorized data result: { favourite: X }` | X > 0 means it worked! |

## Problem Diagnosis Guide

### Problem: "Your Favourites" Section Empty

**Check these logs in order:**

1. ✅ Do you see `🔄 toggleFavorite called`?
   - No? Click handler not firing
   - Yes? Continue...

2. ✅ Do you see `❤️ Adding favorite`?
   - No? State update failed
   - Yes? Continue...

3. ✅ Do you see `💾 Saving favorites`?
   - No? Storage error
   - Yes? Continue...

4. ✅ Do you see `📝 TopupProducts: favorites changed`?
   - No? Hook not updating component
   - Yes? Continue...

5. ✅ Do you see `🎨 CategoryDisplay received props` with `favouriteIds: [...]`?
   - No? Props not being passed
   - Favorites: []? Data lost somewhere
   - Yes? Continue...

6. ✅ Do you see `❤️ isFavourite: Product X is favourite`?
   - No? Product ID doesn't match stored ID
   - Yes? Continue...

7. ✅ Do you see `✅ Categorized data result: { favourite: 1 ... }`?
   - No? Different issue
   - favourite: 0? Product wasn't recognized
   - favourite: 1? Should show in UI
   - Yes? Continue...

8. ✅ Check browser DevTools → Application → LocalStorage
   - Should have `topupProductFavorites_0x...` key
   - Should contain product ID

If you get to step 8 with `favourite: 1` but still no section:
→ Issue is in the rendering logic (CategorySection component)

## Expected Behavior

### ✅ Working Scenario
```
Heart clicked
  ↓
All logs appear 1-9 in order
  ↓
Log #9 shows: favourite: 1
  ↓
localStorage has data
  ↓
"Your Favourites" section appears with product
```

### ❌ Broken Scenarios

**Missing logs 1-3:**
→ Click handler not firing

**Missing logs 4-6:**
→ Hook not updating or props not passed

**Log 6 with favouriteIds: []:**
→ Data lost between hook and display

**Log 8 doesn't show:**
→ Product ID mismatch

**Log 9 shows favourite: 0:**
→ Product not recognized as favorite

**Log 9 shows favourite: 1 but no section:**
→ Rendering issue in CategorySection

## Quick Reference

| Symptom | Check Log |
|---------|-----------|
| Heart doesn't work | Step 1 - toggleFavorite called |
| Data not saving | Step 3 - Saving favorites |
| Component doesn't update | Step 4 - favorites changed |
| Props not passed | Step 6 - CategoryDisplay received |
| Product not recognized | Step 8 - isFavourite |
| Count is wrong | Step 9 - Categorized result |
| Section not rendering | Check if favourite: 0 or 1 |

---

**Use this diagram to:**
1. Understand the complete flow
2. Identify where each log appears
3. Diagnose problems when testing
4. Know what to look for in console
