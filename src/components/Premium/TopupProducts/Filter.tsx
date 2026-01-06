"use client";

import { useStore } from "@/contexts/StoreContext";
import { useState, useMemo } from "react";
import styles from "./TopupProduct.module.css";
import { getCategoryStats, CategorizedProduct } from "@/utils/productCategorization";

type CategoryType = "others" | "favourite" | "popular" | "new_release" | "trending";
type PlatformType = "mobile" | "pc" | "console";

const MAIN_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "favourite", label: "Favourite" },
  { id: "popular", label: "Popular" },
  { id: "others", label: "Others" },
];

const PLATFORMS = [
  { id: "mobile", label: "Mobile" },
  { id: "pc", label: "PC" },
  { id: "console", label: "Console" },
];

const FilterPremium = (props: {
  categoryId: string | undefined | null;
  setCategoryId: (arg: string | undefined) => void;
  onPlatformChange?: (platform: PlatformType | undefined) => void;
  products?: any[];
  favouriteIds?: string[];
}) => {
  const { store } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    props.categoryId ? (props.categoryId as CategoryType) : null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType | undefined>();

  // Calculate category counts for all products
  const categoryStats = useMemo(() => {
    if (!props.products) return null;
    return getCategoryStats(props.products, props.favouriteIds);
  }, [props.products, props.favouriteIds]);

  // Calculate platform counts for the selected category (or all products if no category selected)
  const platformStats = useMemo(() => {
    if (!props.products) return null;

    const { filterProductsByCategory, getCategorizedProducts } = require("@/utils/productCategorization");

    // If no category selected (All), use all products. Otherwise filter by category.
    const filteredProducts = selectedCategory
      ? filterProductsByCategory(
          props.products,
          selectedCategory,
          undefined, // No platform filter yet
          props.favouriteIds
        )
      : props.products;

    // Get platform counts for filtered products
    const categorized = getCategorizedProducts(filteredProducts, props.favouriteIds);
    return {
      mobile: categorized.filter((p: CategorizedProduct) => p.platform === "mobile").length,
      pc: categorized.filter((p: CategorizedProduct) => p.platform === "pc").length,
      console: categorized.filter((p: CategorizedProduct) => p.platform === "console").length,
    };
  }, [props.products, props.favouriteIds, selectedCategory]);

  const handleCategorySelect = (category: CategoryType | string | null) => {
    // If "all" is selected, clear the category filter
    if (category === "all") {
      setSelectedCategory(null);
      props.setCategoryId(undefined);
    } else {
      setSelectedCategory(category as CategoryType);
      props.setCategoryId(category || undefined);
    }
  };

  const handlePlatformSelect = (platform: PlatformType | undefined) => {
    setSelectedPlatform(platform);
    props.onPlatformChange?.(platform);
  };

  return (
    <div className="mb-3 rounded-xl bg-white/10 p-4 backdrop-blur-md space-y-4">
      {/* Main Categories */}
      <div className="flex flex-wrap gap-2">
        {MAIN_CATEGORIES.map((category) => {
          const isAllCategory = category.id === "all";
          const isSelected = isAllCategory ? !selectedCategory : selectedCategory === category.id;
          const count = isAllCategory
            ? (categoryStats?.favourite || 0) + (categoryStats?.popular || 0) + (categoryStats?.others || 0)
            : categoryStats?.[category.id as keyof typeof categoryStats] || 0;

          return (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className={`rounded-xl p-2 px-4 text-sm font-medium transition-colors ${
                isSelected ? styles.active : "opacity-60 hover:opacity-80"
              }`}
              style={
                isSelected
                  ? { backgroundColor: store?.buttonColor ?? "blue" }
                  : undefined
              }
              title={categoryStats ? `${count} items` : undefined}
            >
              {category.label}
              {categoryStats && (
                <span className="ml-2 text-xs opacity-70">
                  ({typeof count === "number" ? count : 0})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Platform Selection - always shown */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-200">
          Platform
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePlatformSelect(undefined)}
            className={`rounded-xl p-2 px-3 text-sm transition-colors ${
              !selectedPlatform ? styles.active : "opacity-60 hover:opacity-80"
            }`}
            style={
              !selectedPlatform
                ? { backgroundColor: store?.buttonColor ?? "blue" }
                : undefined
            }
          >
            All
            {platformStats && (
              <span className="ml-2 text-xs opacity-70">
                ({platformStats.mobile + platformStats.pc + platformStats.console})
              </span>
            )}
          </button>
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform.id as PlatformType)}
              className={`rounded-xl p-2 px-3 text-sm transition-colors ${
                selectedPlatform === platform.id
                  ? styles.active
                  : "opacity-60 hover:opacity-80"
              }`}
              style={
                selectedPlatform === platform.id
                  ? { backgroundColor: store?.buttonColor ?? "blue" }
                  : undefined
              }
            >
              {platform.label}
              {platformStats && (
                <span className="ml-2 text-xs opacity-70">
                  ({platformStats[platform.id as keyof typeof platformStats]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPremium;
