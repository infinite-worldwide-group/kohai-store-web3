"use client";

import { useStore } from "@/contexts/StoreContext";

import styles from "./Store.module.css";

const StoreBackground = () => {
  const { store, setStore } = useStore();

  if (!store?.bgImageUrl || !store?.isPremium) return null;

  return (
    <div className="fixed left-0 right-0 top-0">
      <img src={store?.bgImageUrl} className={`opacity-40 ${styles.bgImage}`} />
      <div
        className="absolute bottom-0 left-0 right-0 top-0"
        style={{
          zIndex: 2,
          background: `linear-gradient(
            180deg,
            transparent 0%,
            transparent 0%,
            ${store?.backgroundColor} 100%
          )`,
        }}
      ></div>
    </div>
  );
};

export default StoreBackground;
