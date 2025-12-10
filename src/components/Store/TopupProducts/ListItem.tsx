"use client";

import { TopupProductFragment } from "graphql/generated/graphql";
import { useStore } from "@/contexts/StoreContext";
import { isColorDark } from "@/lib/ColorUtils";
import Link from "next/link";
import styles from "./TopupProduct.module.css";

const TopupProductListItem = (props: {
  item: TopupProductFragment;
  from?: string;
  slug?: string;
  onItemClick?: (item: TopupProductFragment) => void;
}) => {
  const { store } = useStore();
  const { title, publisher, avatarUrl, logoUrl, slug } = props.item;

  const isButtonDark = !!store?.buttonColor
    ? isColorDark(String(store.buttonColor))
    : true;

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
    <Link href={link} onClick={handleClick}>
      <div
        className={`rounded-lg bg-white text-center shadow-default ${styles.card}`}
        style={{ backgroundImage: `url(${avatarUrl})` }}
      >
        <div className={styles.gradientOverlay}></div>
        <div className={`px-4 py-5 ${styles.context}`}>
          {!!logoUrl && <img src={logoUrl} className={styles.logo} />}
          <h5 className="font-semibold">{title}</h5>
          <p className="mb-2 text-sm text-slate-300">
            {typeof publisher === 'string' ? publisher : publisher?.name}
          </p>
          {!props.from && (
            <button
              className={`flex w-full justify-center rounded bg-primary p-2 font-medium uppercase text-gray text-opacity-80 hover:bg-opacity-90 ${isButtonDark ? "text-white" : "text-black"}`}
              style={{
                backgroundColor: store?.buttonColor ?? undefined,
              }}
            >
              Topup
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TopupProductListItem;
