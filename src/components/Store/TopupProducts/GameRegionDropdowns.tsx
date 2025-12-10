"use client";

import React, { useState, useMemo, useCallback } from "react";
import { TopupProductFragment } from "graphql/generated/graphql";
import {
  groupProductsByGameAndRegion,
  getUniqueGames,
  getRegionsForGame,
  getProductsForGameAndRegion,
  getProductCountForGame,
  getProductCountForGameAndRegion,
  GroupedProducts,
} from "@/utils/productGrouping";
import { formatRegionDisplay, sortRegionsByPriority } from "@/utils/regionMapping";

export interface GameRegionDropdownsProps {
  products: TopupProductFragment[];
  onProductSelect?: (product: TopupProductFragment) => void;
  onGameSelect?: (gameName: string) => void;
  onRegionSelect?: (regionCode: string) => void;
  onProductsFiltered?: (products: TopupProductFragment[]) => void;
  showProductCount?: boolean;
  showStats?: boolean;
  disabled?: boolean;
}

/**
 * GameRegionDropdowns Component
 * 
 * Provides a 3-level hierarchical selection interface:
 * 1. Game Selection - Choose from available games
 * 2. Region Selection - Choose region(s) for selected game
 * 3. Product Items - Display/select items for selected region
 * 
 * @example
 * <GameRegionDropdowns
 *   products={data.topupProducts}
 *   onProductSelect={(product) => console.log(product)}
 *   showProductCount={true}
 * />
 */
const GameRegionDropdowns: React.FC<GameRegionDropdownsProps> = ({
  products,
  onProductSelect,
  onGameSelect,
  onRegionSelect,
  onProductsFiltered,
  showProductCount = true,
  showStats = false,
  disabled = false,
}) => {
  // State for selected game and region
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");

  // Memoize grouped products to prevent unnecessary recalculations
  const groupedProducts: GroupedProducts = useMemo(
    () => groupProductsByGameAndRegion(products),
    [products]
  );

  // Get available games (sorted)
  const games: string[] = useMemo(
    () => getUniqueGames(groupedProducts),
    [groupedProducts]
  );

  // Get regions for selected game (sorted by priority)
  const regions: string[] = useMemo(() => {
    if (!selectedGame) return [];
    const gameRegions = getRegionsForGame(groupedProducts, selectedGame);
    return sortRegionsByPriority(gameRegions);
  }, [selectedGame, groupedProducts]);

  // Get products for selected game and region
  const selectedProducts: TopupProductFragment[] = useMemo(
    () =>
      selectedGame && selectedRegion
        ? getProductsForGameAndRegion(groupedProducts, selectedGame, selectedRegion)
        : [],
    [selectedGame, selectedRegion, groupedProducts]
  );

  // Handle game selection
  const handleGameChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const game = e.target.value;
      setSelectedGame(game);
      setSelectedRegion(""); // Reset region when game changes
      onGameSelect?.(game);

      // Call filtered callback with all products for this game
      if (game) {
        const gameProducts: TopupProductFragment[] = [];
        Object.values(groupedProducts[game] || {}).forEach((products) => {
          gameProducts.push(...products);
        });
        onProductsFiltered?.(gameProducts);
      } else {
        onProductsFiltered?.(products);
      }
    },
    [groupedProducts, products, onGameSelect, onProductsFiltered]
  );

  // Handle region selection
  const handleRegionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const region = e.target.value;
      setSelectedRegion(region);
      onRegionSelect?.(region);

      // Call filtered callback with products for this region
      if (region && selectedGame) {
        const regionProducts = getProductsForGameAndRegion(
          groupedProducts,
          selectedGame,
          region
        );
        onProductsFiltered?.(regionProducts);
      }
    },
    [selectedGame, groupedProducts, onRegionSelect, onProductsFiltered]
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    (product: TopupProductFragment) => {
      onProductSelect?.(product);
    },
    [onProductSelect]
  );

  // Handle reset
  const handleReset = useCallback(() => {
    setSelectedGame("");
    setSelectedRegion("");
    onProductsFiltered?.(products);
  }, [products, onProductsFiltered]);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Filter by Game & Region
        </h3>
        {(selectedGame || selectedRegion) && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Dropdowns Container */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Dropdown 1: Game Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Game {showProductCount && games.length > 0 && <span className="text-gray-500">({games.length})</span>}
          </label>
          <select
            value={selectedGame}
            onChange={handleGameChange}
            disabled={disabled || games.length === 0}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">
              {games.length === 0 ? "No games available" : "-- Select a Game --"}
            </option>
            {games.map((game) => (
              <option key={game} value={game}>
                {game}
                {showProductCount && ` (${getProductCountForGame(groupedProducts, game)})`}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Region Selection (Only shown if game is selected) */}
        {selectedGame && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Region {showProductCount && regions.length > 0 && <span className="text-gray-500">({regions.length})</span>}
            </label>
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              disabled={disabled || regions.length === 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">
                {regions.length === 0 ? "No regions available" : "-- Select a Region --"}
              </option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {formatRegionDisplay(region)}
                  {showProductCount && ` - ${getProductCountForGameAndRegion(groupedProducts, selectedGame, region)} items`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stats Display (Optional) */}
      {showStats && selectedGame && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 border border-blue-200">
          <p>
            Selected Game: <strong>{selectedGame}</strong>
            {selectedRegion && ` • Region: ${selectedRegion}`}
          </p>
        </div>
      )}

      {/* Product Items Grid (Only shown if both game and region are selected) */}
      {selectedRegion && selectedProducts.length > 0 && (
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Available Products{" "}
            <span className="text-gray-500">({selectedProducts.length})</span>
          </label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {selectedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                disabled={disabled}
                className="rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <h4 className="font-semibold text-gray-900 line-clamp-2">
                  {product.title}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {product.topupProductItems?.length || 0} item
                  {(product.topupProductItems?.length || 0) !== 1 ? "s" : ""}
                </p>
                {product.description && (
                  <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state - Region selected but no products */}
      {selectedRegion && selectedProducts.length === 0 && (
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800 border border-yellow-200">
          <p className="text-sm font-medium">No products available</p>
          <p className="mt-1 text-xs text-yellow-700">
            There are no products for {selectedGame} • {selectedRegion}
          </p>
        </div>
      )}

      {/* Empty state - No games available */}
      {games.length === 0 && !selectedGame && (
        <div className="rounded-lg bg-gray-50 p-4 text-gray-700 border border-gray-200">
          <p className="text-sm font-medium">No games available</p>
          <p className="mt-1 text-xs text-gray-600">
            Games will appear here once products are loaded
          </p>
        </div>
      )}
    </div>
  );
};

export default GameRegionDropdowns;
