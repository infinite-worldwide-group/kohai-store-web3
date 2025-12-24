# How to Categorize "New Release" and "Trending"

## 1. NEW RELEASE Detection

### Current Logic
```typescript
const isNewRelease = (product: any): boolean => {
  // Check if created within last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const productDate = new Date(product.createdAt);
  return productDate > sixtyDaysAgo;
};
```

### Requirements
Your product needs:
```typescript
{
  createdAt: Date | string; // ISO date or Date object
}
```

### Examples of Product Data
```javascript
// ✅ This WILL be New Release (created 20 days ago)
{
  id: "1",
  title: "Genshin Impact",
  createdAt: "2025-11-27"  // Recent
}

// ❌ This WON'T be New Release (created 100 days ago)
{
  id: "2",
  title: "Valorant",
  createdAt: "2025-08-10"  // Old
}
```

### Customization Options

#### Change time window:
```typescript
// 14 days (more strict)
const fourteenDaysAgo = new Date();
fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

// 90 days (more lenient)
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
```

---

## 2. TRENDING Detection

### Current Logic (Any ONE of these makes it trending)
```typescript
const isTrending = (product: any): boolean => {
  // Method 1: Recent sales spike
  if (product.recentSales && product.recentSales > 10) return true;
  
  // Method 2: Weekly purchases
  if (product.weeklyPurchases && product.weeklyPurchases > 20) return true;
  
  // Method 3: Backend trending flag
  if (product.isTrending) return true;
  
  return false;
};
```

### Option A: Backend Flag (EASIEST ✅)
**If your API already marks trending products:**

```typescript
// Your API returns this
{
  id: "1",
  title: "Popular Game",
  isTrending: true  // ← Backend tells you it's trending
}

// Your code just needs to check:
if (product.isTrending) return true;
```

### Option B: Recent Sales (GOOD 👍)
**If your API tracks sales in the last period:**

```typescript
{
  id: "1",
  title: "Popular Game",
  recentSales: 25  // ← Sales in last 7 days (adjust number)
}

// Detect trending:
if (product.recentSales && product.recentSales > 10) return true;
```

**Customize threshold:**
```typescript
// Very strict (10+ sales = trending)
if (product.recentSales && product.recentSales > 10) return true;

// Moderate (20+ sales = trending)
if (product.recentSales && product.recentSales > 20) return true;

// Lenient (5+ sales = trending)
if (product.recentSales && product.recentSales > 5) return true;
```

### Option C: Weekly Purchases
**If your API tracks purchases per week:**

```typescript
{
  id: "1",
  title: "Popular Game",
  weeklyPurchases: 35  // ← Purchases in last 7 days
}

// Detect trending:
if (product.weeklyPurchases && product.weeklyPurchases > 20) return true;
```

### Option D: Purchase Count Growth (ADVANCED)
**If you can calculate velocity:**

```typescript
{
  id: "1",
  title: "Popular Game",
  purchases: 100,           // Total purchases
  purchasesLastWeek: 30,    // Last 7 days
  purchasesLastMonth: 60    // Last 30 days
}

// Trending if growing fast:
const growthRate = product.purchasesLastWeek / product.purchasesLastMonth;
if (growthRate > 0.5) return true; // 50%+ of month's sales happened last week
```

### Option E: Rating with Recency
**If you have ratings and want trending high-rated:**

```typescript
{
  id: "1",
  title: "Popular Game",
  rating: 4.8,              // High rating
  ratingCount: 500,         // Recently reviewed
  recentReviews: 100        // Recent reviews in last week
}

// Trending if highly rated AND getting reviews:
if (product.rating >= 4.5 && product.recentReviews > 20) return true;
```

### Option F: Views/Clicks (if available)
**If your API tracks engagement:**

```typescript
{
  id: "1",
  title: "Popular Game",
  viewsThisWeek: 500,       // Page views last 7 days
  clicksThisWeek: 80        // Click conversions last 7 days
}

// Trending if high engagement:
if (product.viewsThisWeek > 200) return true;
```

---

## Complete Implementation Guide

### Step 1: Check What Data Your API Returns

Run this in your browser console to see what's available:
```javascript
// In Store component
console.log("First product:", data?.topupProducts?.[0]);
```

Look for any of these fields:
- ✅ `createdAt` / `created_at` - for New Release
- ✅ `isTrending` / `trending` - for Trending flag
- ✅ `recentSales` / `salesLastWeek` - for Trending detection
- ✅ `weeklyPurchases` / `purchasesThisWeek` - for Trending detection
- ✅ `views` / `viewsThisWeek` - for engagement
- ✅ `rating` / `ratingCount` - for quality trending

### Step 2: Update the Detection Functions

**Example: If your API has `isTrending` flag**
```typescript
export const isTrending = (product: any): boolean => {
  // Your API already marks it
  if (product.isTrending) return true;
  return false;
};
```

**Example: If your API has `salesLastWeek`**
```typescript
export const isTrending = (product: any): boolean => {
  // Trending if 15+ sales last week
  if (product.salesLastWeek && product.salesLastWeek > 15) return true;
  return false;
};
```

**Example: Combination (multiple detection methods)**
```typescript
export const isTrending = (product: any): boolean => {
  // Method 1: Backend says it's trending
  if (product.isTrending) return true;
  
  // Method 2: High sales this week
  if (product.salesLastWeek && product.salesLastWeek > 20) return true;
  
  // Method 3: Highly rated and getting reviews
  if (product.rating >= 4.7 && product.recentReviewCount > 10) return true;
  
  // Method 4: High engagement
  if (product.viewsThisWeek > 300) return true;
  
  return false;
};
```

---

## What Does Your API Return?

Ask your API/backend team:

**For New Release:**
- ✅ Do products have a `createdAt` timestamp?

**For Trending:**
- ✅ Do you have a `isTrending` boolean flag?
- ✅ Do you track sales per time period (daily/weekly)?
- ✅ Do you track purchase count?
- ✅ Do you track page views or engagement?
- ✅ Do you track ratings and review activity?

---

## Quick Test

To see if categorization is working:

**In your browser console:**
```javascript
// Open DevTools (F12) → Console tab
// Run this in Store component:

const { getCategorizedProducts } = await import('/src/utils/productCategorization.ts');
const products = data?.topupProducts || [];
const categorized = getCategorizedProducts(products);

console.log("New Releases:", categorized.filter(p => p.categories.includes("new_release")));
console.log("Trending:", categorized.filter(p => p.categories.includes("trending")));
```

---

## Summary

| Category | Detection Method | Needs API Field | Current Status |
|----------|-----------------|-----------------|-----------------|
| **New Release** | Created < 60 days ago | `createdAt` | ✅ Working |
| **Trending** | Recent sales > 10 | `recentSales` | ✅ Ready to use |
| **Trending** | Weekly purchases > 20 | `weeklyPurchases` | ✅ Ready to use |
| **Trending** | Backend flag | `isTrending` | ✅ Ready to use |

**Next Steps:**
1. Check what data your API returns
2. Update the functions if needed
3. Test in browser console
4. Adjust thresholds based on your data
