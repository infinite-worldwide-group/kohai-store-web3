"use client";

import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import { useCurrency } from "@/components/Store/CurrencySelector/HeaderCurrencySelector";
import { useCurrencyConversion, useCurrencyFormatter } from "@/hooks/useCurrencyConversion";
import { useCurrentUserQuery } from "graphql/generated/graphql";
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

  // Get user's tier discount
  const { data: currentUserData } = useCurrentUserQuery({ skip: false });
  const user = currentUserData?.currentUser;

  // Calculate discount from tier name - MATCH BACKEND CONFIG
  const getTierDiscount = (tierName: string | null | undefined): number => {
    if (!tierName) return 0;
    const lowerTier = tierName.toLowerCase();
    if (lowerTier === "elite") return 1;
    if (lowerTier === "grandmaster") return 2;
    if (lowerTier === "legend") return 3;
    return 0;
  };

  // Always use backend discountPercent if provided (>= 0), otherwise fallback to tier name
  const discountPercent = (user?.discountPercent !== undefined && user?.discountPercent !== null && user.discountPercent >= 0)
    ? user.discountPercent
    : getTierDiscount(user?.tierName);

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

  // PRIORITY 1: Use the currency field from the database if available
  // PRIORITY 2: Fallback to USD if not specified
  // This ensures we always use the correct currency from the backend
  const originalCurrency = (currency && typeof currency === 'string')
    ? currency.toUpperCase()
    : 'USD';
  
  // Convert price from original currency to selected currency
  const convertedPrice = selectedCurrency.code === originalCurrency
    ? priceValue
    : convertPrice(priceValue, originalCurrency, selectedCurrency.code) || priceValue;

  // Calculate discounted price
  const discountAmount = (convertedPrice * discountPercent) / 100;
  const discountedPrice = convertedPrice - discountAmount;

  // Format prices with selected currency
  const formattedSellingPrice = formatPrice(convertedPrice, selectedCurrency);
  const formattedDiscountedPrice = formatPrice(discountedPrice, selectedCurrency);
  const formattedCostPrice = storePricing?.formattedCostPrice || '';
  const itemIcon = iconUrl || icon;

  const hasDiscount = discountPercent > 0;

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
          <div className="text-lg opacity-70">
            {props.showCost && "Selling: "}
            {hasDiscount ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  textDecoration: 'line-through',
                  opacity: 0.6,
                  fontSize: '0.9em'
                }}>
                  {formattedSellingPrice}
                </span>
                <span style={{
                  color: '#00C853',
                  fontWeight: 'bold'
                }}>
                  {formattedDiscountedPrice}
                </span>
                <span style={{
                  fontSize: '0.75em',
                  background: '#00C853',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  -{discountPercent}%
                </span>
              </div>
            ) : (
              <span>
                {formattedSellingPrice}{" "}
                {props.showCost && (
                  <>
                    (+{Number(store?.markupRate) * 100}%)
                  </>
                )}
              </span>
            )}
          </div>
          {props.showCost && <p>Cost: {formattedCostPrice}</p>}
        </div>
      </div>
    </div>
  );
};

export default TopupProductItem;
