"use client";

import Loader from "@/components/common/Loader";
import FilterPremium from "@/components/Premium/TopupProducts/Filter";
import PremiumListItem from "@/components/Premium/TopupProducts/ListItem";
import { useStore } from "@/contexts/StoreContext";
import { useTopupProductsQuery } from "graphql/generated/graphql";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import TopupProductListItem from "./ListItem";

const TopupProducts = (props: { from?: string; slug?: string }) => {
  const { store } = useStore();

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

  // Filter products by selected category (client-side)
  const filteredProducts = data?.topupProducts?.filter(product => {
    if (!categoryId) return true; // Show all if no category selected
    return product.category === categoryId;
  }) || [];

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
          products={data?.topupProducts}
        />
      </div>

      {!!search && (
        <p className="mb-4 text-sm opacity-60">
          {filteredProducts.length} search results for {search}
        </p>
      )}

      {!!categoryId && (
        <p className="mb-4 text-sm opacity-60">
          Showing {filteredProducts.length} products in category: {categoryId.replace("_", " ")}
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
        <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-4">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full text-center opacity-60">
              No products found {categoryId && `in category: ${categoryId.replace("_", " ")}`}
            </p>
          ) : (
            filteredProducts.map((item, index) => {
              if (store?.isPremium) {
                return (
                  <PremiumListItem
                    item={item}
                    key={`topup-products-${index}`}
                    from={props.from}
                    slug={props.slug}
                  />
                );
              } else {
                return (
                  <TopupProductListItem
                    item={item}
                    key={`topup-products-${index}`}
                    from={props.from}
                    slug={props.slug}
                  />
                );
              }
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TopupProducts;
