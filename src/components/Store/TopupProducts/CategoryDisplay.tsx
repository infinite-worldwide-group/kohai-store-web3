"use client";

import { useMemo } from "react";
import { getCategorizedProducts } from "@/utils/productCategorization";
import TopupProductListItem from "./ListItem";
import PremiumListItem from "@/components/Premium/TopupProducts/ListItem";
import Loader from "@/components/common/Loader";

type CategoryType = "others" | "favourite" | "popular" | "new_release" | "trending";
type PlatformType = "mobile" | "pc" | "console";

interface CategorySectionProps {
  title: string;
  products: any[];
  categoryId: CategoryType;
  isPremium?: boolean;
  from?: string;
  slug?: string;
  onItemClick?: (item: any) => void;
}

const CategorySection = ({
  title,
  products,
  categoryId,
  isPremium,
  from,
  slug,
  onItemClick,
  showPlatform,
}: CategorySectionProps & { showPlatform?: boolean }) => {
  if (!products || products.length === 0) {
    return null;
  }

  // Check if this is the popular section for special styling
  const isPopularSection = categoryId === "popular";

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>
          <p className="text-sm text-white opacity-80 mt-1">
            {products.length} {products.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {/* Horizontal scrolling layout for mobile, grid for desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
          {products.map((item, index) => (
            <div key={`${categoryId}-${index}`}>
              {isPremium ? (
                <PremiumListItem
                  item={item}
                  from={from}
                  slug={slug}
                  onItemClick={onItemClick}
                  showPlatform={showPlatform}
                />
              ) : (
                <TopupProductListItem
                  item={item}
                  from={from}
                  slug={slug}
                  onItemClick={onItemClick}
                  showPlatform={showPlatform}
                  isPopular={isPopularSection}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile horizontal scroll */}
      <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-3 min-w-full">
          {products.map((item, index) => (
            <div key={`${categoryId}-${index}`} className="flex-shrink-0 w-40">
              {isPremium ? (
                <PremiumListItem
                  item={item}
                  from={from}
                  slug={slug}
                  onItemClick={onItemClick}
                  showPlatform={showPlatform}
                />
              ) : (
                <TopupProductListItem
                  item={item}
                  from={from}
                  slug={slug}
                  onItemClick={onItemClick}
                  showPlatform={showPlatform}
                  isPopular={isPopularSection}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CategoryDisplayProps {
  products: any[];
  loading: boolean;
  favouriteIds?: string[];
  isPremium?: boolean;
  from?: string;
  slug?: string;
  selectedPlatform?: "mobile" | "pc" | "console";
  onItemClick?: (item: any) => void;
}

const CategoryDisplay = ({
  products,
  loading,
  favouriteIds,
  isPremium,
  from,
  slug,
  selectedPlatform,
  onItemClick,
}: CategoryDisplayProps) => {

  console.log('🎨 CategoryDisplay received props:', {
    productsCount: products?.length,
    favouriteIds: favouriteIds,
    favouriteCount: favouriteIds?.length,
    selectedPlatform: selectedPlatform,
    loading
  });

  const categorizedData = useMemo(() => {
    console.log('🔄 Recategorizing products with favouriteIds:', favouriteIds, 'Products count:', products?.length, 'Platform:', selectedPlatform);
    console.log('📋 Full favouriteIds array:', JSON.stringify(favouriteIds));

    // First categorize all products
    const categorized = getCategorizedProducts(products, favouriteIds);

    console.log('🔍 First 3 categorized products:', categorized.slice(0, 3).map(p => ({
      id: p.product.id,
      title: p.product.title,
      categories: p.categories,
      isFavInArray: favouriteIds?.includes(p.product.id)
    })));

    // Then filter by platform if selected
    let filteredCategorized = categorized;
    if (selectedPlatform) {
      filteredCategorized = categorized.filter(p => p.platform === selectedPlatform);
      console.log(`📱 Filtered by platform ${selectedPlatform}: ${filteredCategorized.length} products`);
    }

    // Get all favourited products
    const favouriteProducts = filteredCategorized.filter(p => p.categories.includes("favourite")).map(p => p.product);

    // For each category, include ALL products (favourited + non-favourited)
    // This ensures favourited products appear in both Favourite AND their original category
    const result = {
      others: filteredCategorized.filter(p => p.categories.includes("others")).map(p => p.product),
      favourite: favouriteProducts,
      popular: filteredCategorized.filter(p => p.categories.includes("popular")).map(p => p.product),
      new_release: filteredCategorized.filter(p => p.categories.includes("new_release")).map(p => p.product),
      trending: filteredCategorized.filter(p => p.categories.includes("trending")).map(p => p.product),
    };

    console.log('✅ Categorized data result:', {
      favourite: result.favourite.length,
      popular: result.popular.length,
      newRelease: result.new_release.length,
      trending: result.trending.length,
      others: result.others.length,
      totalCategorized: filteredCategorized.length,
      favouriteIds: favouriteIds,
      favouriteProducts: result.favourite.map(p => ({ id: p.id, title: p.title }))
    });

    return result;
  }, [products, favouriteIds, selectedPlatform]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  // Show platform badges when no specific platform is selected
  const showPlatformBadges = !selectedPlatform;

  return (
    <div className="space-y-12 py-8">
      {/* Favourite Section - Show first */}
      {categorizedData.favourite.length > 0 && (
        <CategorySection
          title="❤️ Your Favourites"
          products={categorizedData.favourite}
          categoryId="favourite"
          isPremium={isPremium}
          from={from}
          slug={slug}
          onItemClick={onItemClick}
          showPlatform={showPlatformBadges}
        />
      )}

      {/* Trending Section */}
      <CategorySection
        title="🔥 Trending Now"
        products={categorizedData.trending}
        categoryId="trending"
        isPremium={isPremium}
        from={from}
        slug={slug}
        onItemClick={onItemClick}
        showPlatform={showPlatformBadges}
      />

      {/* New Release Section */}
      <CategorySection
        title="✨ New Release"
        products={categorizedData.new_release}
        categoryId="new_release"
        isPremium={isPremium}
        from={from}
        slug={slug}
        onItemClick={onItemClick}
        showPlatform={showPlatformBadges}
      />

      {/* Popular Section */}
      <CategorySection
        title="⭐ Popular"
        products={categorizedData.popular}
        categoryId="popular"
        isPremium={isPremium}
        from={from}
        slug={slug}
        onItemClick={onItemClick}
        showPlatform={showPlatformBadges}
      />

      {/* Others Products Section */}
      <CategorySection
        title="📦 Others"
        products={categorizedData.others}
        categoryId="others"
        isPremium={isPremium}
        from={from}
        slug={slug}
        onItemClick={onItemClick}
        showPlatform={showPlatformBadges}
      />
    </div>
  );
};

export default CategoryDisplay;
