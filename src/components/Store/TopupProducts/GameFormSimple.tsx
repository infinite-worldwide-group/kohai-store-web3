"use client";

import { useState } from "react";
import { TopupProductFragment } from "graphql/generated/graphql";
import TopupProductItem from "./TopupProductItem";
import PurchaseForm from "./PurchaseForm";

const GameFormSimple = (props: { item: TopupProductFragment; slug?: string }) => {
  const { topupProductItems, userInput } = props.item;
  const [selectedItem, setSelectedItem] = useState<any>(null);

  return (
    <>
      {/* Step Indicator */}
      <div className="mb-6 flex items-center gap-4">
        {/* Step 1 */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${!selectedItem ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-all duration-300 ${
            !selectedItem
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
              : 'bg-white/10 text-white/60'
          }`}>
            1
          </div>
          <span className={`text-sm font-semibold transition-all duration-300 ${!selectedItem ? 'text-white' : 'text-white/60'}`}>
            Select Product
          </span>
        </div>

        {/* Connector Line */}
        <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full" />

        {/* Step 2 */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${selectedItem ? 'opacity-100' : 'opacity-50'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold transition-all duration-300 ${
            selectedItem
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110 shadow-lg'
              : 'bg-white/10 text-white/60'
          }`}>
            2
          </div>
          <span className={`text-sm font-semibold transition-all duration-300 ${selectedItem ? 'text-white' : 'text-white/60'}`}>
            Complete Purchase
          </span>
        </div>
      </div>

      {/* Product Items Grid - Animated slide down when hidden */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          selectedItem
            ? 'max-h-0 opacity-0 pointer-events-none'
            : 'max-h-[2000px] opacity-100'
        }`}
      >
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topupProductItems?.map((item, index) => (
            <TopupProductItem
              item={item}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              key={`item-${index}`}
              showCost={false}
            />
          ))}
        </div>

        {(!topupProductItems || topupProductItems.length === 0) && (
          <p className="text-center text-sm opacity-60">No packages available</p>
        )}
      </div>

      {/* Purchase Form - Animated slide up when shown */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          selectedItem
            ? 'max-h-[3000px] opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        {selectedItem && (
          <PurchaseForm
            productItem={selectedItem}
            userInput={userInput}
            onChangeProduct={() => setSelectedItem(null)}
          />
        )}
      </div>
    </>
  );
};

export default GameFormSimple;
