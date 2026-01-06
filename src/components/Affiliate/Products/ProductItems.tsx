"use client";

import TopupProductItem from "@/components/Store/TopupProducts/TopupProductItem";
import {
  GamecreditStoreFragment,
  TopupProductFragment,
  TopupProductItemFragment,
  useStoreTopupProductItemsQuery,
} from "graphql/generated/graphql";
import { useState } from "react";

const ProductItems = (props: {
  item: TopupProductFragment;
  store: GamecreditStoreFragment;
}) => {
  const store = props.store;
  const { code, userInput, id, vendor } = props.item;

  const { data, loading: loadingItems } = useStoreTopupProductItemsQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      id: id,
      exchangeRate:
        store?.exchangeRates.filter((i) => i.id == vendor?.id)[0].rate ?? 1,
      storeMarkupRate: store?.markupRate ?? 0,
      vendorMarkupRate:
        store?.vendorRates.filter((i) => i.id == vendor?.id)[0].rate ?? 0,
      currency: store?.currency,
    },
  });

  const [selectedItem, setSelectedItem] = useState<
    TopupProductItemFragment | undefined
  >();

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {loadingItems && (
        <div className="my-4 flex gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          <p className="opacity-60">Loading items...</p>
        </div>
      )}
      {data?.topupProduct.items &&
        data.topupProduct.items.map((i, index) => (
          <TopupProductItem
            item={i}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            key={`item-${index}`}
            showCost
          />
        ))}
    </div>
  );
};

export default ProductItems;
