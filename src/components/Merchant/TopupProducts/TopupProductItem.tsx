"use client";

import { TopupProductItemFragment } from "graphql/generated/graphql";

import styles from "./TopupProduct.module.css";

const TopupProductItem = (props: {
  item: TopupProductItemFragment;
  selectedItem: TopupProductItemFragment | undefined;
  setSelectedItem: (arg: TopupProductItemFragment | undefined) => void;
}) => {
  const { name, id, iconUrl } = props.item;

  const isSelected = props.item.id == props.selectedItem?.id;

  return (
    <div
      className={`rounded-lg p-2 px-3 ${isSelected ? "bg-white" : "bg-gray-300"}`}
    >
      <div className="flex flex-row gap-4">
        {!!iconUrl && <img src={iconUrl} className={styles.avatar} />}
        <div>
          <h3>{name}</h3>
          {/* <p>{priceAsMoney}</p> */}
        </div>
      </div>
    </div>
  );
};

export default TopupProductItem;
