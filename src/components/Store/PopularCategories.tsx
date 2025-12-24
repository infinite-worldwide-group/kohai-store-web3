"use client";

import { useTopupProductsQuery } from "graphql/generated/graphql";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/hooks/useFavorites";

const PopularCategories = () => {
  const { data, loading } = useTopupProductsQuery({
    variables: {
      page: 1,
      perPage: 12,
    },
  });

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Filter only featured products
  const allFeatured = data?.topupProducts?.filter(product => product.featured) || [];

  // Sort: favorites first, then others, and limit to 6
  const featuredProducts = allFeatured
    .sort((a, b) => {
      const aIsFav = isFavorite(a.id);
      const bIsFav = isFavorite(b.id);
      if (aIsFav && !bIsFav) return -1;
      if (!aIsFav && bIsFav) return 1;
      return 0;
    })
    .slice(0, 6);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Popular Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="w-full aspect-square bg-gray-700 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Popular Categories</h2>
        <Link
          href="/product"
          className="text-sm text-blue-400 hover:text-blue-300 transition"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {featuredProducts.map((product) => {
          const isProductFavorite = isFavorite(product.id);

          return (
            <div
              key={product.id}
              className="group bg-gray-800/50 hover:bg-gray-800 rounded-lg p-4 transition-all hover:scale-105 border border-gray-700 hover:border-blue-500 relative"
            >
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-2 left-2 z-10 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-all"
                aria-label={isProductFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isProductFavorite ? (
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>

              <Link href={`/${product.slug}`}>
                <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-lg bg-gray-900">
                  {product.logoUrl ? (
                    <Image
                      src={product.logoUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    ⭐ Featured
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition line-clamp-2">
                  {product.title}
                </h3>

                {product.publisher && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {product.publisher}
                  </p>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;
