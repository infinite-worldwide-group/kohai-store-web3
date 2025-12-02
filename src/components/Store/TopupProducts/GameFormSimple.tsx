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
      {/* Product Items Grid - Original Design */}
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

      {/* Purchase Form - Only shown when item is selected */}
      {selectedItem && (
        <div className="mt-6">
          <PurchaseForm productItem={selectedItem} userInput={userInput} />
        </div>
      )}
    </>
  );
};

export default GameFormSimple;
