"use client";

import SupportFab from "@/components/User/Footer/SupportFab";
import { AffiliateProvider } from "@/contexts/AffiliateContext";
import { EmailVerificationProvider } from "@/contexts/EmailVerificationContext";
import { MerchantProvider } from "@/contexts/MerchantContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { UserProvider } from "@/contexts/UserContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { CurrencyProvider } from "@/components/Store/CurrencySelector";
import "@/css/satoshi.css";
import "@/css/style.css";
import CustomApolloProvider from "@/lib/CustomApolloProvider";
import "@/lib/reown-config"; // Initialize Reown
import GoogleAnalytics from "@/utils/GoogleAnalytics";
import FacebookPixel from "@/utils/FacebookPixel";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";
import React, { useEffect, useState } from "react";
import "./embla.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ backgroundColor: "rgb(0, 0, 0)" }}>
        <FacebookPixel />
        <GoogleAnalytics />
        <CustomApolloProvider>
          <WalletProvider>
            <CurrencyProvider>
              <UserProvider>
                <EmailVerificationProvider>
                  <MerchantProvider>
                    <AffiliateProvider>
                      <StoreProvider>
                        <div style={{ backgroundColor: "rgb(0, 0, 0)", color: "#ffffff" }}>
                          <main>{children}</main>
                        </div>
                        <SupportFab />
                      </StoreProvider>
                    </AffiliateProvider>
                  </MerchantProvider>
                </EmailVerificationProvider>
              </UserProvider>
            </CurrencyProvider>
          </WalletProvider>
        </CustomApolloProvider>
      </body>
    </html>
  );
}
