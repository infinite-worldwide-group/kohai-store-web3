"use client";
import Header from "@/components/Header";
import { useMerchant } from "@/contexts/MerchantContext";
import { useUser } from "@/contexts/UserContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  useCurrentMerchantLazyQuery,
  useCurrentUserLazyQuery,
} from "graphql/generated/graphql";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MerchantSidebar from "../Sidebar/MerchantSidebar";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useUser();
  const { setMerchant } = useMerchant();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [jwtToken] = useLocalStorage<string | null>("jwtToken", null);

  const [getUser, { data }] = useCurrentUserLazyQuery();
  const [getMerchant, { data: merchantData }] = useCurrentMerchantLazyQuery();

  const checkSession = async () => {
    if (!!jwtToken) {
      getUser();
      getMerchant();
    } else {
      router.replace("/auth/signin");
    }
  };

  useEffect(() => {
    if (data && data.currentUser) {
      setUser(data.currentUser);
    }

    if (merchantData && merchantData.currentMerchant) {
      setMerchant(merchantData.currentMerchant);
    }
  }, [data, merchantData]);

  useEffect(() => {
    checkSession();
  }, [jwtToken]);

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <MerchantSidebar
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
    </>
  );
}
