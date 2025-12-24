# Product Categorization Guide - No Database Changes Needed!

## Overview

You don't need to manually categorize products or modify your database. The system uses **smart logic-based categorization** that automatically determines which category each product belongs to.

## How It Works

### 1. **Platform Detection** (Automatic)
Platform is determined from the product's `category` field:
- **Mobile**: If category contains "mobile"
- **PC**: If category contains "pc" 
- **Console**: If category contains "console"

### 2. **Smart Category Logic**

Each product can automatically belong to multiple categories:

#### **Favourite**
- User has added product to their favorites list
- Requires: `favorites` array passed to filter component

#### **Popular**
Auto-detected based on (any of these):
- `product.sales > 100`
- `product.rating >= 4.5`
- `product.featured === true`
- `product.purchaseCount > 50`

#### **New Release**
- Product created within last 30 days
- Requires: `product.createdAt` field

#### **Trending**
Auto-detected based on (any of these):
- `product.recentSales > 10`
- `product.weeklyPurchases > 20`
- `product.isTrending === true`

#### **All Products**
- Every product automatically belongs to this category

## Setup Instructions

### Step 1: Ensure Products Have Required Data

Your products should ideally have these fields (for better categorization):
```typescript
{
  id: string;
  category: string; // "Mobile Game", "PC Game", "Console Game"
  featured: boolean; // for popular detection
  sales?: number; // for popular detection
  rating?: number; // for popular detection
  createdAt: DateTime; // for new release detection
  recentSales?: number; // for trending detection
  weeklyPurchases?: number; // for trending detection
  isTrending?: boolean; // for trending detection
}
```

### Step 2: The Categorization Logic Is Already Integrated!

**File**: `/src/utils/productCategorization.ts`

This utility provides:
- `getPlatform(product)` - Detects platform from category
- `isPopular(product)` - Checks if product is popular
- `isNewRelease(product)` - Checks if product is new (last 30 days)
- `isTrending(product)` - Checks if product is trending
- `categorizeProduct(product, favoriteIds)` - Gets all categories for a product
- `filterProductsByCategory(products, category, platform, favoriteIds)` - Filters products

### Step 3: Pass Products to Filter Components

**Store Component** (`src/components/Store/TopupProducts/index.tsx`):
```tsx
<FilterPremium
  categoryId={categoryId}
  setCategoryId={setCategoryId}
  onPlatformChange={setSelectedPlatform}
  products={data?.topupProducts}      // Pass products
  favouriteIds={favorites}             // Pass favorites list
/>
```

**Merchant Component** (`src/components/Merchant/TopupProducts/index.tsx`):
```tsx
<Filter
  categoryId={categoryId}
  setCategoryId={setCategoryId}
  onPlatformChange={setSelectedPlatform}
  products={data?.merchantTopupProducts}  // Pass products
/>
```

## How Filtering Works

### User Journey:
1. User sees: **All Products | Favourite | Popular | New Release | Trending**
2. User clicks a category (e.g., "Popular")
3. System shows: **Platform selector (Mobile | PC | Console)**
4. User selects a platform (optional)
5. Products are filtered based on:
   - ✅ Category match (e.g., is product popular?)
   - ✅ Platform match (e.g., is it mobile?)

### Behind The Scenes:
```
For each product:
  1. Detect platform from category field
  2. Check if it matches selected category logic
  3. Check if platform matches (if selected)
  4. Include only if BOTH checks pass
```

## Customizing Category Logic

You can customize how categories are determined. Edit `/src/utils/productCategorization.ts`:

### Example: Make "Popular" require higher sales
```typescript
export const isPopular = (product: any): boolean => {
  // Changed from 100 to 500 sales minimum
  if (product.sales && product.sales > 500) return true;
  
  if (product.rating && product.rating >= 4.5) return true;
  if (product.featured) return true;
  if (product.purchaseCount && product.purchaseCount > 100) return true;
  
  return false;
};
```

### Example: Make "New Release" 60 days instead of 30
```typescript
export const isNewRelease = (product: any): boolean => {
  if (!product.createdAt) return false;
  
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60); // Changed from 30
  
  const productDate = new Date(product.createdAt);
  return productDate > sixtyDaysAgo;
};
```

## Data Flow Diagram

```
┌─ API Products (no categorization needed)
│
├─ Filter Component receives products
│  └─ Passes to categorizeProduct() for each product
│
├─ Categorization Logic runs:
│  ├─ Platform detection
│  ├─ Popular check
│  ├─ New Release check (< 30 days)
│  ├─ Trending check
│  └─ Favorite check
│
├─ Filter displays category/platform buttons with counts
│
├─ User selects category → Platform options show
│
├─ User selects platform (optional)
│
└─ filterProductsByCategory() returns matching products
   └─ Display in grid
```

## Features Included

✅ **No Manual Categorization** - Automatic based on logic  
✅ **No Database Changes** - Works with existing data  
✅ **Item Counts** - Shows how many products in each category  
✅ **Multi-Category** - Products can belong to multiple categories  
✅ **Favorites Support** - Integrates with user favorites  
✅ **Type-Safe** - Full TypeScript support  
✅ **Responsive** - Works on mobile/desktop  
✅ **Customizable** - Easy to adjust logic  

## If You NEED Manual Database Categorization

Only do this if you want explicit database fields. You would need to:

1. **Add fields to products**:
```prisma
model TopupProduct {
  // ... existing fields
  isPopular Boolean @default(false)
  isTrending Boolean @default(false)
  isFeatured Boolean @default(false)
}
```

2. **Update product categorization flags** when:
   - New products are created
   - Sales increase
   - Ratings are updated

But this is **optional** - the current logic-based approach works great!

## Troubleshooting

### **Categories are empty?**
- ❌ Check if products have required fields (especially `category` field)
- ✅ Add `console.log()` in categorizeProduct() to debug

### **Platform selector not showing?**
- ❌ Check if `FilterPremium` receives `products` prop
- ✅ Make sure `data?.topupProducts` is passed

### **Item counts show 0?**
- ❌ Verify products meet category criteria
- ✅ Adjust category logic thresholds in `productCategorization.ts`

## Summary

**You don't need to do anything!** The categorization is:
- ✅ **Automatic** - Based on product data
- ✅ **Smart** - Uses multiple detection methods
- ✅ **Dynamic** - Counts update automatically
- ✅ **No DB Changes** - Works with your current API

Just pass the `products` array to the Filter component and it handles the rest! 🚀
