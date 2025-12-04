"use client";

import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import { useCurrency } from "@/components/Store/CurrencySelector/HeaderCurrencySelector";
import { useCurrencyConversion, useCurrencyFormatter } from "@/hooks/useCurrencyConversion";
import styles from "./TopupProduct.module.css";

const TopupProductItem = (props: {
  item: any;
  selectedItem: any | undefined;
  setSelectedItem: (arg: any | undefined) => void;
  showCost: boolean;
}) => {
  const { store } = useStore();
  const { selectedCurrency } = useCurrency();
  const { convertPrice } = useCurrencyConversion();
  const { formatPrice } = useCurrencyFormatter();

  const {
    name,
    displayName,
    id,
    iconUrl,
    icon,
    formattedPrice,
    price,
    currency,
    storePricing,
  } = props.item;

  const priceValue = price || 0;
  
  // Use the currency field from the item data, default to MYR if not specified
  const originalCurrency = currency || 'MYR';
  
  // Convert price from original currency to selected currency
  const convertedPrice = selectedCurrency.code === originalCurrency 
    ? priceValue 
    : convertPrice(priceValue, originalCurrency, selectedCurrency.code) || priceValue;

  // Format price with selected currency
  const formattedSellingPrice = formatPrice(convertedPrice, selectedCurrency);
  const formattedCostPrice = storePricing?.formattedCostPrice || '';
  const itemIcon = iconUrl || icon;

  const isSelected = props.item.id == props.selectedItem?.id;

  const isDark = !!store?.backgroundColor
    ? isColorDark(String(store.backgroundColor))
    : true;

  const cardStyle = store?.isPremium
    ? `cursor-pointer rounded-lg  p-2 px-3 backdrop-blur-lg bg-white/10`
    : `cursor-pointer rounded-lg  p-2 px-3 `;

  const selectedStyle = store?.isPremium
    ? styles.selected
    : "bg-opacity-1 bg-success";

  return (
    <div
      className={`${cardStyle} ${isSelected ? selectedStyle : `${isDark ? "bg-white/10" : "bg-black/10"} `}`}
      onClick={() => props.setSelectedItem(props.item)}
      style={{ borderWidth: 1, borderColor: "transparent" }}
    >
      <div className="flex flex-row items-center gap-4">
        {!!itemIcon ? (
          <img src={itemIcon} className={styles.avatar} />
        ) : (
          <img src="/images/diamond.png" className={styles.avatar} />
        )}
        <div className={isSelected ? "text-white" : undefined}>
          <h4 className="mb-1 text-sm font-medium">{displayName || name}</h4>
          <p className="text-lg opacity-70">
            {props.showCost && "Selling: "}
            {formattedSellingPrice}{" "}
            {props.showCost && (
              <>
                (+{Number(store?.markupRate) * 100}
                %)
              </>
            )}
          </p>
          {props.showCost && <p>Cost: {formattedCostPrice}</p>}
        </div>
      </div>
    </div>
  );
};

export default TopupProductItem;
