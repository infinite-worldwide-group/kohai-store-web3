"use client";

import StoreLayout from "@/components/Layouts/StoreLayout";
import MyOrdersList from "@/components/Store/MyOrdersList";

export default function MyOrdersPage() {
  return (
    <StoreLayout>
      <MyOrdersList />
    </StoreLayout>
  );
}
