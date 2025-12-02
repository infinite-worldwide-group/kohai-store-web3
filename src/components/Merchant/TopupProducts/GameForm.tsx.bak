"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import {
  TopupProductFragment,
  TopupProductItemFragment,
} from "graphql/generated/graphql";
import { useState } from "react";
import TopupProductItem from "./TopupProductItem";

const GameForm = (props: { item: TopupProductFragment }) => {
  const { code, userInput, items } = props.item;

  const [payment, setPayment] = useState<
    "fiuu" | "kohai" | "billplz" | undefined
  >();
  const [selectedItem, setSelectedItem] = useState<
    TopupProductItemFragment | undefined
  >();

  return (
    <>
      <Breadcrumb pageName="Items"></Breadcrumb>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items &&
          items.map((i) => (
            <TopupProductItem
              item={i}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          ))}
      </div>
    </>
  );
};

export default GameForm;
