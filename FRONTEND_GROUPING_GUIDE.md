# Frontend 2-Level Dropdown Implementation Guide

## Overview

The backend now extracts `game_name` and `region_code` from TopupProduct titles automatically. This guide shows how to implement a hierarchical dropdown structure on the frontend:

1. **Dropdown 1**: Select a Game (e.g., "Mobile Legends: Bang Bang")
2. **Dropdown 2**: Select a Region (e.g., "MY/SG")  
3. **Dropdown 3**: View/Select Items for the selected Region

## Data Structure

### Sample Backend Response

```graphql
{
  topupProducts: [
    {
      id: "1",
      title: "Mobile Legends: Bang Bang (MY/SG)",
      gameName: "Mobile Legends: Bang Bang",
      regionCode: "MY/SG",
      topupProductItems: [...]
    },
    {
      id: "2",
      title: "Mobile Legends: Bang Bang (TH/VN)",
      gameName: "Mobile Legends: Bang Bang",
      regionCode: "TH/VN",
      topupProductItems: [...]
    }
  ]
}
```

## Grouping Strategy

### Step 1: Create Grouping Utility

```typescript
// src/utils/productGrouping.ts

import { TopupProductFragment } from "@/graphql/generated/graphql";

export interface GroupedProducts {
  [gameName: string]: {
    [regionCode: string]: TopupProductFragment[];
  };
}

/**
 * Groups products by game_name, then by region_code
 * Extracts both values from the title field
 */
export function groupProductsByGameAndRegion(
  products: TopupProductFragment[]
): GroupedProducts {
  const grouped: GroupedProducts = {};

  products.forEach((product) => {
    // Extract game_name and region_code from title
    const { gameName, regionCode } = parseProductTitle(product.title);

    // Initialize game if not exists
    if (!grouped[gameName]) {
      grouped[gameName] = {};
    }

    // Initialize region if not exists
    if (!grouped[gameName][regionCode]) {
      grouped[gameName][regionCode] = [];
    }

    // Add product to grouped structure
    grouped[gameName][regionCode].push(product);
  });

  return grouped;
}

/**
 * Parses title to extract game_name and region_code
 * Example: "Mobile Legends: Bang Bang (MY/SG)" 
 *   → { gameName: "Mobile Legends: Bang Bang", regionCode: "MY/SG" }
 */
export function parseProductTitle(title: string): {
  gameName: string;
  regionCode: string;
} {
  // Match pattern: "Game Name (REGION_CODE)"
  const match = title.match(/^(.+?)\s*\(([A-Z]{2}(?:\/[A-Z]{2})*)\)$/);

  if (match) {
    return {
      gameName: match[1].trim(),
      regionCode: match[2].trim(),
    };
  }

  // Fallback: use full title as game name
  return {
    gameName: title,
    regionCode: "UNKNOWN",
  };
}

/**
 * Get unique games from grouped products
 */
export function getUniqueGames(grouped: GroupedProducts): string[] {
  return Object.keys(grouped).sort();
}

/**
 * Get regions for a specific game
 */
export function getRegionsForGame(
  grouped: GroupedProducts,
  gameName: string
): string[] {
  if (!grouped[gameName]) return [];
  return Object.keys(grouped[gameName]).sort();
}

/**
 * Get products for a specific game and region
 */
export function getProductsForGameAndRegion(
  grouped: GroupedProducts,
  gameName: string,
  regionCode: string
): TopupProductFragment[] {
  return grouped[gameName]?.[regionCode] || [];
}
```

### Step 2: Create Dropdown Component

```typescript
// src/components/Store/TopupProducts/GameRegionDropdowns.tsx

"use client";

import React, { useState, useMemo } from "react";
import { TopupProductFragment } from "@/graphql/generated/graphql";
import {
  groupProductsByGameAndRegion,
  getUniqueGames,
  getRegionsForGame,
  getProductsForGameAndRegion,
} from "@/utils/productGrouping";

interface GameRegionDropdownsProps {
  products: TopupProductFragment[];
  onProductSelect?: (product: TopupProductFragment) => void;
  onGameSelect?: (gameName: string) => void;
  onRegionSelect?: (regionCode: string) => void;
}

const GameRegionDropdowns: React.FC<GameRegionDropdownsProps> = ({
  products,
  onProductSelect,
  onGameSelect,
  onRegionSelect,
}) => {
  // State for selected game and region
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Memoize grouped products
  const groupedProducts = useMemo(
    () => groupProductsByGameAndRegion(products),
    [products]
  );

  // Get available games
  const games = useMemo(() => getUniqueGames(groupedProducts), [groupedProducts]);

  // Get regions for selected game
  const regions = useMemo(
    () => (selectedGame ? getRegionsForGame(groupedProducts, selectedGame) : []),
    [selectedGame, groupedProducts]
  );

  // Get products for selected game and region
  const selectedProducts = useMemo(
    () =>
      selectedGame && selectedRegion
        ? getProductsForGameAndRegion(groupedProducts, selectedGame, selectedRegion)
        : [],
    [selectedGame, selectedRegion, groupedProducts]
  );

  // Handle game selection
  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const game = e.target.value;
    setSelectedGame(game);
    setSelectedRegion(""); // Reset region when game changes
    onGameSelect?.(game);
  };

  // Handle region selection
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value;
    setSelectedRegion(region);
    onRegionSelect?.(region);
  };

  // Handle product selection
  const handleProductSelect = (product: TopupProductFragment) => {
    onProductSelect?.(product);
  };

  return (
    <div className="space-y-4">
      {/* Dropdown 1: Game Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Game
        </label>
        <select
          value={selectedGame}
          onChange={handleGameChange}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">-- Select a Game --</option>
          {games.map((game) => (
            <option key={game} value={game}>
              {game}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown 2: Region Selection (Only shown if game is selected) */}
      {selectedGame && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Region
          </label>
          <select
            value={selectedRegion}
            onChange={handleRegionChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Select a Region --</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Product Items Grid (Only shown if both game and region are selected) */}
      {selectedRegion && selectedProducts.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Available Items
          </label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="rounded-lg border border-gray-300 bg-white p-3 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900">{product.title}</h4>
                <p className="text-sm text-gray-600">
                  Items: {product.topupProductItems.length}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedRegion && selectedProducts.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
          No products available for this region
        </div>
      )}
    </div>
  );
};

export default GameRegionDropdowns;
```

### Step 3: Integration in TopupProducts Page

```typescript
// src/components/Store/TopupProducts/index.tsx

// ... existing imports ...
import GameRegionDropdowns from "./GameRegionDropdowns";

const TopupProducts = (props: { from?: string; slug?: string }) => {
  const { store } = useStore();

  // ... existing state and hooks ...

  const { data, loading, error, refetch } = useTopupProductsQuery({
    variables: {
      page: page,
      perPage: 100,
      countryCode: "MY",
      forStore: true,
      // ... other variables
    },
  });

  return (
    <div>
      {/* New Dropdown Section */}
      {data?.topupProducts && (
        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold">Filter by Game & Region</h3>
          <GameRegionDropdowns
            products={data.topupProducts}
            onProductSelect={(product) => {
              console.log("Selected product:", product);
              // Handle product selection here
            }}
          />
        </div>
      )}

      {/* Rest of existing component... */}
    </div>
  );
};

export default TopupProducts;
```

## Alternative: Simple State Management Approach

If you prefer a more straightforward approach without a separate component:

```typescript
const TopupProducts = () => {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Group products
  const groupedProducts = useMemo(
    () => groupProductsByGameAndRegion(data?.topupProducts || []),
    [data?.topupProducts]
  );

  // Get unique games
  const games = useMemo(() => getUniqueGames(groupedProducts), [groupedProducts]);

  // Get regions for selected game
  const regions = useMemo(
    () => getRegionsForGame(groupedProducts, selectedGame),
    [selectedGame, groupedProducts]
  );

  // Get products for selected game and region
  const filteredProducts = useMemo(
    () =>
      selectedGame && selectedRegion
        ? getProductsForGameAndRegion(groupedProducts, selectedGame, selectedRegion)
        : data?.topupProducts || [],
    [selectedGame, selectedRegion, groupedProducts, data?.topupProducts]
  );

  return (
    <>
      {/* Render dropdowns */}
      <select value={selectedGame} onChange={(e) => setSelectedGame(e.target.value)}>
        <option value="">All Games</option>
        {games.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {selectedGame && (
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      )}

      {/* Render filtered products */}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4">
        {filteredProducts.map((item, index) => (
          <TopupProductListItem item={item} key={`topup-products-${index}`} />
        ))}
      </div>
    </>
  );
};
```

## Key Features

✅ **Automatic Parsing**: Extracts `game_name` and `region_code` from title  
✅ **Memoized Grouping**: Efficient re-rendering with React.useMemo  
✅ **Type-Safe**: Full TypeScript support  
✅ **Reusable**: Separate utility and component files  
✅ **Responsive**: Works on mobile and desktop  
✅ **Customizable**: Easy to add more callbacks and styling  

## Testing the Implementation

```typescript
// Example test data
const testProducts: TopupProductFragment[] = [
  {
    id: "1",
    title: "Mobile Legends: Bang Bang (MY/SG)",
    topupProductItems: [...],
    // ... other fields
  },
  {
    id: "2",
    title: "Mobile Legends: Bang Bang (TH/VN)",
    topupProductItems: [...],
    // ... other fields
  },
  {
    id: "3",
    title: "Genshin Impact (US)",
    topupProductItems: [...],
    // ... other fields
  },
];

// Test grouping
const grouped = groupProductsByGameAndRegion(testProducts);
console.log(grouped);
// Output:
// {
//   "Mobile Legends: Bang Bang": {
//     "MY/SG": [product1],
//     "TH/VN": [product2]
//   },
//   "Genshin Impact": {
//     "US": [product3]
//   }
// }
```

## Next Steps

1. **Add new GraphQL fields** to your schema (if not already done):
   ```graphql
   type TopupProduct {
     gameName: String!
     regionCode: String!
     # ... existing fields
   }
   ```

2. **Update GraphQL fragments** to include the new fields in queries

3. **Regenerate GraphQL types** with `npm run codegen`

4. **Implement the utility and component** from this guide

5. **Test with real data** from your API

## Performance Considerations

- **Memoization**: All grouping operations use `useMemo` to prevent unnecessary recalculations
- **Client-side Filtering**: No additional API calls needed; all grouping happens in the browser
- **Lazy Rendering**: Region and product dropdowns only render when previous selections are made

## Styling Notes

The component uses Tailwind CSS. Adjust the className values to match your design system if needed.

```typescript
// Example: Dark mode variant
const darkModeSelect = "rounded-lg bg-gray-800 text-white border-gray-700...";
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Regions dropdown doesn't update | Ensure `selectedGame` is properly set before accessing regions |
| Products not filtering | Check that both `selectedGame` and `selectedRegion` are set |
| Slow performance with many products | Verify `useMemo` dependencies are correct |
| Region codes not parsing correctly | Update the regex in `parseProductTitle()` to match your format |

---

**Last Updated**: December 9, 2025  
**Status**: Ready for Implementation ✅
