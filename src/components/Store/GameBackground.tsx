"use client";

import { useStore } from "@/contexts/StoreContext";

const GameBackground = (props: { image?: string | null | undefined }) => {
  if (!props.image) return null;

  const { store } = useStore();

  return (
    <div
      className="fixed left-0 right-0 top-0 opacity-60"
      style={{
        height: `60vh`,
        backgroundImage: `url(${props.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 top-0"
        style={{
          zIndex: 2,
          background: `linear-gradient(
            180deg,
            transparent 0%,
            ${store?.backgroundColor} 100%
          )`,
        }}
      ></div>
    </div>
  );
};

export default GameBackground;
