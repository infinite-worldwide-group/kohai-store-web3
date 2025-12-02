"use client";
import { useStore } from "@/contexts/StoreContext";
import Link from "next/link";
import React from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import styles from "./Footer.module.css";

const SupportFab: React.FC = () => {
  const { store } = useStore();

  const url = !!store?.csUrl ? store.csUrl : "https://tawk.to/chat/6809e9764a25191909a03abb/1ipjbftu7";

  return (
    <Link href={url} target="_blank">
      <div
        className={styles.fab}
        style={{ backgroundColor: store?.buttonColor ?? undefined }}
      >
        <IoChatbubblesSharp
          color={store?.backgroundColor ?? "white"}
          size={24}
        />
      </div>
    </Link>
  );
};

export default SupportFab;
