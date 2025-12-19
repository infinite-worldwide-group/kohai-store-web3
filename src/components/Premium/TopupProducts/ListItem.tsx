"use client";

import { TopupProductFragment } from "graphql/generated/graphql";

import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import Link from "next/link";
import styles from "./TopupProduct.module.css";

const PremiumListItem = (props: {
  item: TopupProductFragment;
  from?: string;
  slug?: string;
  onItemClick?: (item: TopupProductFragment) => void;
  showPlatform?: boolean;
}) => {
  const { store } = useStore();
  const { title, slug, avatarUrl, logoUrl, id, category } = props.item;

  const isButtonDark = !!store?.buttonColor
    ? isColorDark(String(store.buttonColor))
    : true;

  // Determine platform from category
  const getPlatformInfo = () => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("mobile")) return { name: "Mobile", icon: "📱", color: "bg-blue-500" };
    if (cat.includes("pc")) return { name: "PC", icon: "💻", color: "bg-purple-500" };
    if (cat.includes("console")) return { name: "Console", icon: "🎮", color: "bg-green-500" };
    return { name: "Mobile", icon: "📱", color: "bg-blue-500" };
  };

  const platformInfo = getPlatformInfo();

  const handleClick = (e: React.MouseEvent) => {
    if (props.onItemClick) {
      e.preventDefault();
      props.onItemClick(props.item);
    }
  };

  const link = !!props.slug
    ? `/${props.slug}/${slug}`
    : !!props.from
      ? `/store/products/${slug}`
      : `/store/${slug}`;

  return (
    <Link
      href={link}
      onClick={handleClick}
      className="group"
    >
      <div
        className={`relative rounded-lg bg-black text-center shadow-md md:mx-2.5 ${styles.card}`}
        style={{
          backgroundImage: `url(${avatarUrl})`,
        }}
      >
        <div
          className={`${styles.gradientOverlay} transition-all duration-200 ease-in-out md:group-hover:backdrop-blur-md`}
        ></div>

        {/* Platform Badge - Top Right */}
        {props.showPlatform && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`${platformInfo.color} rounded-full px-2 py-1 text-xs font-semibold text-white shadow-lg flex items-center gap-1`}>
              <span>{platformInfo.icon}</span>
              <span className="hidden sm:inline">{platformInfo.name}</span>
            </div>
          </div>
        )}

        <div className={`px-4 py-5 ${styles.context}`}>
          {!!logoUrl && <img src={logoUrl} className={styles.logo} />}
          <div className="text-xs opacity-80 md:hidden">{title}</div>
          {!props.from && (
            <div className="hidden transition-all duration-200 ease-in-out md:group-hover:block ">
              <button
                className={`rounded-xl text-sm font-medium uppercase ${styles.buyButton}`}
                style={{
                  backgroundColor: store?.buttonColor ?? undefined,
                }}
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
      <div
        className={`relative bg-white/10 shadow-2xl backdrop-blur-sm ${styles.nameContainer} hidden md:block`}
      >
        <h5 className="text-sm font-semibold">{title}</h5>
      </div>
    </Link>
  );
};

export default PremiumListItem;
