"use client";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { useStore } from "@/contexts/StoreContext";
import { useUser } from "@/contexts/UserContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  useCurrentAffiliateLazyQuery,
  useCurrentStoreLazyQuery,
  useCurrentUserLazyQuery,
} from "graphql/generated/graphql";
import { useRouter } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import Header from "../Affiliate/Header";
import AffiliateSidebar from "../Sidebar/AffiliateSidebar";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useUser();
  const { setAffiliate } = useAffiliate();
  const { setStore } = useStore();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jwtToken] = useLocalStorage<string | null>("jwtToken", null);

  const [getUser, { data }] = useCurrentUserLazyQuery();
  const [getAffiliate, { data: affiliateData }] =
    useCurrentAffiliateLazyQuery();
  const [getStore, { data: storeData }] = useCurrentStoreLazyQuery();

  const checkSession = async () => {
    if (!!jwtToken) {
      getUser();
      getAffiliate();
      getStore();
    } else {
      router.replace("/store/auth/signin");
    }
  };

  useEffect(() => {
    if (data && data.currentUser) {
      setUser(data.currentUser);
    }

    if (affiliateData && affiliateData.currentAffiliate) {
      setAffiliate(affiliateData.currentAffiliate);
    }

    if (storeData && storeData.currentStore) {
      setStore(storeData.currentStore);
    }
  }, [data, affiliateData, storeData]);

  useEffect(() => {
    checkSession();
  }, [jwtToken]);

  return (
    <Suspense>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <AffiliateSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col lg:ml-72.5">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto min-h-screen max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </Suspense>
  );
}
