"use client";

import React, { useMemo, useEffect, useState } from "react";
import { TopupProductFragment } from "graphql/generated/graphql";
import { parseProductTitle } from "@/utils/productGrouping";
import { formatRegionDisplay, sortRegionsByPriority, getRegionFlags } from "@/utils/regionMapping";

interface RegionSelectorModalProps {
  isOpen: boolean;
  game: TopupProductFragment | null;
  products: TopupProductFragment[];
  onRegionSelect: (product: TopupProductFragment) => void;
  onClose: () => void;
}

/**
 * RegionSelector Modal - Modern Design
 * Shows available regions for a selected game with cool animations and effects
 * User clicks a region to proceed with that product variant
 */
const RegionSelectorModal: React.FC<RegionSelectorModalProps> = ({
  isOpen,
  game,
  products,
  onRegionSelect,
  onClose,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Get regions for this game from products
  const gameRegions = useMemo(() => {
    if (!game) return [];

    // Find all products with the same game name but different regions
    const gameName = parseProductTitle(game.title).gameName;

    const regions = products
      .filter(p => parseProductTitle(p.title).gameName === gameName)
      .map(p => ({
        product: p,
        regionCode: parseProductTitle(p.title).regionCode,
      }));

    // Extract region codes and sort by priority
    const regionCodes = regions.map(r => r.regionCode);
    const sortedCodes = sortRegionsByPriority(regionCodes);

    // Return regions in sorted order
    return sortedCodes.map(code =>
      regions.find(r => r.regionCode === code)!
    );
  }, [game, products]);

  // Trigger animation when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen || !game) return null;

  const gameName = parseProductTitle(game.title).gameName;

  return (
    <>
      {/* Animated Overlay with Glassmorphism */}
      <div
        className={`fixed inset-0 z-40 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-lg transform transition-all duration-300 ${
            isAnimating
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-95 opacity-0"
          }`}
        >
          {/* Modal Card with Gradient Border */}
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] shadow-2xl">
            <div className="rounded-2xl bg-white">
              {/* Header with Gradient Background */}
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-6">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent)]" />
                </div>

                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="h-1 w-8 rounded-full bg-white/40" />
                      <div className="h-1 w-4 rounded-full bg-white/30" />
                    </div>
                    <h2 className="text-xl font-bold text-white drop-shadow-lg">
                      {gameName}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-white/90">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Choose your region to continue
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close"
                  >
                    <svg
                      className="h-5 w-5 text-white transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Region Count Badge */}
              {gameRegions.length > 0 && (
                <div className="px-6 pt-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 text-sm font-medium text-purple-700">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    {gameRegions.length} {gameRegions.length === 1 ? "Region" : "Regions"} Available
                  </div>
                </div>
              )}

              {/* Content - Region Cards */}
              <div className="max-h-[450px] overflow-y-auto px-6 py-6">
                {gameRegions.length > 0 ? (
                  <div className="space-y-3">
                    {gameRegions.map(({ product, regionCode }, index) => (
                      <button
                        key={product.id}
                        onClick={() => {
                          onRegionSelect(product);
                          onClose();
                        }}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                        className="group relative w-full overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-transparent hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 animate-in fade-in slide-in-from-bottom-2"
                      >
                        {/* Gradient Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />

                        {/* Animated Border Gradient on Hover */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ padding: "2px" }}>
                          <div className="h-full w-full rounded-xl bg-white" />
                        </div>

                        <div className="relative flex items-center justify-between">
                          {/* Left Side - Flag and Info */}
                          <div className="flex flex-1 items-center gap-4">
                            {/* Flag Circle */}
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-2xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                              {getRegionFlags(regionCode)}
                            </div>

                            {/* Region Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold text-gray-900 transition-colors group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text">
                                {formatRegionDisplay(regionCode, { showFlags: false })}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                  />
                                </svg>
                                Code: {regionCode}
                              </p>
                              {product.description && (
                                <p className="mt-1.5 text-xs text-gray-600 line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Side - Arrow Icon */}
                          <div className="ml-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:from-purple-500 group-hover:to-pink-500">
                            <svg
                              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Shimmer Effect on Hover */}
                        <div className="absolute inset-0 -translate-x-full transform bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-600">No regions available</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Regions will appear here when available
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:from-gray-200 hover:to-gray-300 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegionSelectorModal;
