import { MerchantSessionFragment } from "graphql/generated/graphql";
import { createContext, ReactNode, useContext, useState } from "react";

interface MerchantContextType {
  merchant: MerchantSessionFragment | null;
  setMerchant: (merchant: MerchantSessionFragment | null) => void;
}

const MerchantContext = createContext<MerchantContextType | undefined>(
  undefined,
);

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<MerchantSessionFragment | null>(
    null,
  );

  const value = {
    merchant,
    setMerchant,
  };

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (context === undefined) {
    throw new Error("useMerchant must be used within a MerchantProvider");
  }
  return context;
}
