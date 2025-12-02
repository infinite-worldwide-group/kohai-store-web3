"use client";

import { TopupProductFragment } from "graphql/generated/graphql";

import Link from "next/link";
import styles from "./TopupProduct.module.css";

const TopupProductListItem = (props: { item: TopupProductFragment }) => {
  const { title, publisher, avatarUrl, logoUrl, id } = props.item;

  return (
    <Link href={`/merchant/products/${id}`}>
      <div
        className={`rounded-lg bg-white text-center shadow-default ${styles.card}`}
        style={{ backgroundImage: `url(${avatarUrl})` }}
      >
        <div className={styles.gradientOverlay}></div>
        <div className={`px-4 py-5 ${styles.context}`}>
          {!!logoUrl && <img src={logoUrl} className={styles.logo} />}
          <h5 className="font-semibold">{title}</h5>
          <p className="mb-2 text-sm text-slate-300">{publisher?.name}</p>
        </div>
      </div>
    </Link>
  );
};

export default TopupProductListItem;
