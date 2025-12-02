import { AffiliateSessionFragment } from "graphql/generated/graphql";
import { createContext, ReactNode, useContext, useState } from "react";

interface AffiliateContextType {
  affiliate: AffiliateSessionFragment | null;
  setAffiliate: (affiliate: AffiliateSessionFragment | null) => void;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(
  undefined,
);

export function AffiliateProvider({ children }: { children: ReactNode }) {
  const [affiliate, setAffiliate] = useState<AffiliateSessionFragment | null>(
    null,
  );

  const value = {
    affiliate,
    setAffiliate,
  };

  return (
    <AffiliateContext.Provider value={value}>
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate() {
  const context = useContext(AffiliateContext);
  if (context === undefined) {
    throw new Error("useAffiliate must be used within a AffiliateProvider");
  }
  return context;
}
