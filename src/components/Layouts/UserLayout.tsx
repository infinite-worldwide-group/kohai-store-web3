"use client";
import { useUser } from "@/contexts/UserContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
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

  const [jwtToken] = useLocalStorage<string | null>("jwtToken", null);

  const [getUser, { data }] = useCurrentUserLazyQuery();

  const checkSession = async () => {
    if (!!jwtToken) {
      getUser();
    }
  };

  useEffect(() => {
    if (data && data.currentUser) {
      setUser(data.currentUser);
    }
  }, [data]);

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
