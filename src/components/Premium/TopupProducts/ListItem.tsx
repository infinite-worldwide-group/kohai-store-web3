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
}) => {
  const { store } = useStore();
  const { title, slug, avatarUrl, logoUrl, id } = props.item;

  const isButtonDark = !!store?.buttonColor
    ? isColorDark(String(store.buttonColor))
    : true;

  return (
    <Link
      href={
        !!props.slug
          ? `/${props.slug}/${slug}`
          : !!props.from
            ? `/store/products/${slug}`
            : `/store/${slug}`
      }
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
