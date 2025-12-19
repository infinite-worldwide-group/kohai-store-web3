"use client";

import Loader from "@/components/common/Loader";
import FilterPremium from "@/components/Premium/TopupProducts/Filter";
import PremiumListItem from "@/components/Premium/TopupProducts/ListItem";
import { useStore } from "@/contexts/StoreContext";
import { useTopupProductsQuery, TopupProductFragment } from "graphql/generated/graphql";
import { parseProductTitle } from "@/utils/productGrouping";
import { filterProductsByCategory } from "@/utils/productCategorization";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import TopupProductListItem from "./ListItem";
import RegionSelectorModal from "./RegionSelectorModal";
import CategoryDisplay from "./CategoryDisplay";
import { useFavorites } from "@/hooks/useFavorites";

type PlatformType = "mobile" | "pc" | "console";
type CategoryType = "others" | "favourite" | "popular" | "new_release" | "trending";

const TopupProducts = (props: { from?: string; slug?: string }) => {
  const { store } = useStore();
  const router = useRouter();
  const { isFavorite, favorites } = useFavorites();

  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const [lastActivity, setLastActivity] = useState(Date.now());

  const [categoryId, setCategoryId] = useState<string | undefined | null>(
    searchParams.get("category_id"),
  );

  const [search, setSearch] = useState<string | undefined | null>(
    searchParams.get("search"),
  );

  const [genre, setGenre] = useState<string | undefined | null>(
    searchParams.get("genre"),
  );

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | undefined>();

  // Show category view only when no specific category is selected
  const showCategoryView = !categoryId;

  // Modal state
  const [selectedGame, setSelectedGame] = useState<TopupProductFragment | null>(null);
  const [showRegionModal, setShowRegionModal] = useState(false);

  // Log whenever favorites change
  useEffect(() => {
    console.log('📝 TopupProducts: favorites changed:', favorites, 'Count:', favorites.length);
  }, [favorites]);

  const { data, loading, error, refetch } = useTopupProductsQuery({
    variables: {
      categoryId: undefined, // Don't filter by category in backend - we'll do it client-side
      page: page,
      perPage: 100,
      countryCode: "MY",
      forStore: true,
      search: search,
      genre: genre,
    },
    fetchPolicy: "network-only", // Always fetch fresh prices from server
    pollInterval: 60000, // Refresh prices every 60 seconds
    onCompleted: (data) => {
      console.log("Query completed successfully:", data);
    },
    onError: (error) => {
      console.error("Query error:", error);
    },
  });

  // Deduplicate ALL products first (for category view)
  // Count regions per game across all products
  const allRegionCountMap = new Map<string, number>();
  (data?.topupProducts || []).forEach(product => {
    const { gameName } = parseProductTitle(product.title);
    allRegionCountMap.set(gameName, (allRegionCountMap.get(gameName) || 0) + 1);
  });

  // Deduplicate all products
  const allDedupedProducts = Array.from(
    (data?.topupProducts || []).reduce((map, product) => {
      const { gameName, regionCode } = parseProductTitle(product.title);

      if (!map.has(gameName)) {
        const regionCount = allRegionCountMap.get(gameName) || 0;
        const displayProduct = { ...product } as TopupProductFragment;

        if (regionCount > 1) {
          displayProduct.title = gameName;
        }

        map.set(gameName, displayProduct);
      } else {
        const current = map.get(gameName)!;
        const currentRegion = parseProductTitle(current.title).regionCode;
        if (regionCode < currentRegion) {
          const regionCount = allRegionCountMap.get(gameName) || 0;
          const displayProduct = { ...product } as TopupProductFragment;

          if (regionCount > 1) {
            displayProduct.title = gameName;
          }

          map.set(gameName, displayProduct);
        }
      }
      return map;
    }, new Map<string, TopupProductFragment>()).values()
  );

  // Filter products by selected category and platform using smart categorization logic
  console.log('📊 TopupProducts - Filtering:', {
    categoryId,
    selectedPlatform,
    favorites,
    favoritesCount: favorites.length,
    totalProducts: data?.topupProducts?.length,
    showCategoryView: !categoryId
  });

  const filteredProducts = filterProductsByCategory(
    data?.topupProducts || [],
    (categoryId as CategoryType) || null,
    selectedPlatform,
    favorites // Pass favorites list for "favourite" category
  );

  console.log('✅ Filtered products result:', {
    categoryId,
    filteredCount: filteredProducts.length,
    sampleProducts: filteredProducts.slice(0, 3).map(p => ({ id: p.id, title: p.title }))
  });

  // Group products by game name and deduplicate (for grid view)
  // First, count regions per game
  const regionCountMap = new Map<string, number>();
  filteredProducts.forEach(product => {
    const { gameName } = parseProductTitle(product.title);
    regionCountMap.set(gameName, (regionCountMap.get(gameName) || 0) + 1);
  });

  // Then group products, modifying title based on region count
  const dedupedProducts = Array.from(
    filteredProducts.reduce((map, product) => {
      const { gameName, regionCode } = parseProductTitle(product.title);

      if (!map.has(gameName)) {
        // Create a modified product based on region count
        const regionCount = regionCountMap.get(gameName) || 0;
        const displayProduct = { ...product } as TopupProductFragment;

        // If multiple regions, show only game name (no region)
        // If single region, show full title with region
        if (regionCount > 1) {
          displayProduct.title = gameName;
        }
        // else: keep original title with region code

        map.set(gameName, displayProduct);
      } else {
        // Keep product with earliest region code (ascending)
        const current = map.get(gameName)!;
        const currentRegion = parseProductTitle(current.title).regionCode;
        if (regionCode < currentRegion) {
          const regionCount = regionCountMap.get(gameName) || 0;
          const displayProduct = { ...product } as TopupProductFragment;

          if (regionCount > 1) {
            displayProduct.title = gameName;
          }

          map.set(gameName, displayProduct);
        }
      }
      return map;
    }, new Map<string, TopupProductFragment>()).values()
  );

  // Sort products: favorites first, then others
  const groupedProducts = (dedupedProducts as TopupProductFragment[]).sort((a, b) => {
    const aIsFav = isFavorite(a.id);
    const bIsFav = isFavorite(b.id);
    if (aIsFav && !bIsFav) return -1;
    if (!aIsFav && bIsFav) return 1;
    return 0;
  });

  // Debug logging
  console.log("TopupProducts Debug:", {
    data,
    loading,
    error,
    categoryId,
    totalProducts: data?.topupProducts?.length,
    filteredProducts: filteredProducts.length,
    variables: {
      categoryId, page, perPage: 100, countryCode: "MY", forStore: true, search, genre
    }
  });

  useEffect(() => {
    if (searchParams.get("category_id") !== categoryId) {
      setCategoryId(searchParams.get("category_id"));
    }

    if (searchParams.get("search") !== search) {
      setSearch(searchParams.get("search"));
    }

    if (searchParams.get("genre") !== genre) {
      setGenre(searchParams.get("genre"));
    }
  }, [searchParams]);

  // Track user activity to detect if page is idle
  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Handle region selection
  const handleRegionSelect = useCallback(
    (product: TopupProductFragment) => {
      // Navigate to the product with the selected region
      if (!!props.slug) {
        router.push(`/${props.slug}/${product.slug}`);
      } else if (!!props.from) {
        router.push(`/store/products/${product.slug}`);
      } else {
        router.push(`/store/${product.slug}`);
      }
    },
    [props.slug, props.from, router]
  );

  // Handle game card click - show region selector modal or redirect directly
  const handleGameClick = useCallback((game: TopupProductFragment) => {
    const { gameName } = parseProductTitle(game.title);

    // Get unique regions by grouping - this ensures we only count distinct region codes
    // Use ALL products, not filtered ones, to find all available regions
    const regionMap = new Map<string, any>();
    (data?.topupProducts || [])
      .filter(p => parseProductTitle(p.title).gameName === gameName)
      .forEach(p => {
        const { regionCode } = parseProductTitle(p.title);
        if (!regionMap.has(regionCode)) {
          regionMap.set(regionCode, p);
        }
      });

    const uniqueRegions = Array.from(regionMap.values());

    // Debug logging
    console.log(`Game: ${gameName}, Unique regions: ${uniqueRegions.length}`, {
      regionMap: Array.from(regionMap.keys()),
      uniqueRegions: uniqueRegions.map(r => r.title)
    });

    // If only one region, redirect directly to topup selection page
    if (uniqueRegions.length === 1) {
      handleRegionSelect(uniqueRegions[0]);
    } else {
      // Multiple regions - show modal for user to select
      setSelectedGame(game);
      setShowRegionModal(true);
    }
  }, [data?.topupProducts, handleRegionSelect]);

  // Set up activity listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track mouse movement, clicks, keyboard, scroll, touch
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity]);

  // Auto-refresh product list to ensure fresh prices
  useEffect(() => {
    const AUTO_REFRESH_INTERVAL = 60 * 1000; // Check every 1 minute
    const INACTIVITY_THRESHOLD = 3 * 60 * 1000; // 3 minutes idle before refresh

    const checkRefresh = setInterval(() => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivity;

      // If user has been inactive, silently refresh product list
      if (timeSinceActivity >= INACTIVITY_THRESHOLD) {
        console.log('Auto-refreshing product list (silent)...');
        refetch(); // Silently refetch product list
        setLastActivity(Date.now()); // Reset timer after refresh
      }
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(checkRefresh);
  }, [lastActivity, refetch]);

  return (
    <div>
      <div className="py-2">
        <FilterPremium
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          onPlatformChange={setSelectedPlatform}
          products={data?.topupProducts}
          favouriteIds={favorites}
        />
      </div>

      {!!search && (
        <p className="mb-4 text-sm opacity-60">
          {groupedProducts.length} search results for {search}
        </p>
      )}

      {!!categoryId && (
        <p className="mb-4 text-sm opacity-60">
          Showing {groupedProducts.length} products in category: {categoryId.replace("_", " ")}
        </p>
      )}

      {error && (
        <div className="rounded bg-red-100 p-4 text-red-700">
          <p className="font-bold">Error loading products:</p>
          <p>{error.message}</p>
          <pre className="mt-2 text-xs">{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      {loading && !data && (
        <div className="p-8 text-center">
          <p>Loading products... (query in progress)</p>
          <p className="mt-2 text-sm opacity-60">If this takes too long, check browser console for errors</p>
        </div>
      )}

      {!loading && !error && !data && (
        <div className="p-8 text-center text-yellow-600">
          Query completed but no data returned
        </div>
      )}

      {data?.topupProducts && (
        <>
          {/* Show all categories view by default */}
          {showCategoryView ? (
            <CategoryDisplay
              key={JSON.stringify(favorites)}
              products={allDedupedProducts}
              loading={loading}
              favouriteIds={favorites}
              isPremium={store?.isPremium}
              from={props.from}
              slug={props.slug}
              selectedPlatform={selectedPlatform}
              onItemClick={handleGameClick}
            />
          ) : (
            // Fallback to grid view if user filters by specific category
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5 lg:grid-cols-5 md:gap-4">
              {groupedProducts.length === 0 ? (
                <p className="col-span-full text-center opacity-60">
                  No products found {categoryId && `in category: ${categoryId.replace("_", " ")}`}
                </p>
              ) : (
                groupedProducts.map((item, index) => {
                  if (store?.isPremium) {
                    return (
                      <PremiumListItem
                        item={item}
                        key={`topup-products-${index}`}
                        from={props.from}
                        slug={props.slug}
                        onItemClick={handleGameClick}
                        showPlatform={!selectedPlatform}
                      />
                    );
                  } else {
                    return (
                      <TopupProductListItem
                        item={item}
                        key={`topup-products-${index}`}
                        from={props.from}
                        slug={props.slug}
                        onItemClick={handleGameClick}
                        showPlatform={!selectedPlatform}
                      />
                    );
                  }
                })
              )}
            </div>
          )}
        </>
      )}

      {/* Region Selector Modal */}
      <RegionSelectorModal
        isOpen={showRegionModal}
        game={selectedGame}
        products={(data?.topupProducts as TopupProductFragment[]) || []}
        onRegionSelect={handleRegionSelect}
        onClose={() => {
          setShowRegionModal(false);
          setSelectedGame(null);
        }}
      />
    </div>
  );
};

export default TopupProducts;
