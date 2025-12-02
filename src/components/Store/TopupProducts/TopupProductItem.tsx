"use client";

import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import styles from "./TopupProduct.module.css";

const TopupProductItem = (props: {
  item: any;
  selectedItem: any | undefined;
  setSelectedItem: (arg: any | undefined) => void;
  showCost: boolean;
}) => {
  const { store } = useStore();

  const {
    name,
    displayName,
    id,
    iconUrl,
    icon,
    formattedPrice,
    price,
    storePricing,
  } = props.item;

  // Detect currency from product name
  const detectCurrency = (): string => {
    const productName = (displayName || name || '').toUpperCase();

    // Malaysian Ringgit
    if (productName.includes('RM') && productName.includes('MY')) return 'MYR';
    if (productName.includes('MYR')) return 'MYR';

    // Singapore Dollar
    if (productName.includes('SGD') || (productName.includes('SG') && productName.includes('$'))) return 'SGD';

    // Indonesian Rupiah
    if (productName.includes('IDR') || productName.includes('INDONESIA')) return 'IDR';

    // Thai Baht
    if (productName.includes('THB') || productName.includes('THAILAND')) return 'THB';

    // Default to USD
    return 'USD';
  };

  // Format price with proper currency symbol
  const formatPriceWithCurrency = (priceValue: number, currency: string): string => {
    switch (currency) {
      case 'MYR':
        return `RM ${priceValue.toFixed(2)}`;
      case 'SGD':
        return `S$${priceValue.toFixed(2)}`;
      case 'IDR':
        return `Rp ${priceValue.toFixed(0)}`;
      case 'THB':
        return `฿${priceValue.toFixed(2)}`;
      case 'USD':
      default:
        return `$${priceValue.toFixed(2)}`;
    }
  };

  const currency = detectCurrency();
  const priceValue = price || 0;

  // Use formatted fiat price instead of backend's formattedPrice
  const formattedSellingPrice = formatPriceWithCurrency(priceValue, currency);
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
