import { GamecreditStoreFragment } from "graphql/generated/graphql";
import { createContext, ReactNode, useContext, useState } from "react";

interface StoreContextType {
  store: GamecreditStoreFragment | null;
  setStore: (store: GamecreditStoreFragment | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<GamecreditStoreFragment | null>(null);

  const value = {
    store,
    setStore,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
