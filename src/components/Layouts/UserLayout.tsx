"use client";
import { useMerchant } from "@/contexts/MerchantContext";
import { useUser } from "@/contexts/UserContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  useCurrentMerchantLazyQuery,
  useCurrentUserLazyQuery,
} from "graphql/generated/graphql";
import React, { useEffect } from "react";
import Header from "../User/Header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser } = useUser();
  const { setMerchant } = useMerchant();

  const [jwtToken] = useLocalStorage<string | null>("jwtToken", null);

  const [getUser, { data }] = useCurrentUserLazyQuery();
  const [getMerchant, { data: merchantData }] = useCurrentMerchantLazyQuery();

  const checkSession = async () => {
    if (!!jwtToken) {
      getUser();
      getMerchant();
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
      <Header />
      <div className="p-2 md:p-4">{children}</div>
    </>
  );
}
