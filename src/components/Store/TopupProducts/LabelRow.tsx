"use client";
import { useStore } from "@/contexts/StoreContext";
import styles from "./TopupProduct.module.css";

const LabelRow = (props: { num: String; label: String }) => {
  const { store } = useStore();

  const { num, label } = props;

  return (
    <div className={styles.labelRow}>
      <div
        className={styles.num}
        style={{
          backgroundColor: store?.buttonColor ?? undefined,
          color: store?.backgroundColor ?? undefined,
        }}
      >
        {num}
      </div>
      <h2 className="text-xl font-bold">{label}</h2>
    </div>
  );
};

export default LabelRow;
