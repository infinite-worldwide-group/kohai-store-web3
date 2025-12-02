"use client";
import CardDataStats from "@/components/CardDataStats";
import { useStore } from "@/contexts/StoreContext";
import React from "react";
import GameChart from "./GameChart";
import OrderTable from "./OrderTable";
const AffiliateDashboard: React.FC = () => {
  const { store } = useStore();

  return (
    <>
      <div className="mt-4 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="mb-5.5 grid w-full grid-cols-2 gap-4">
          <CardDataStats
            title="Total Sales"
            total={store?.formattedTotalSales}
          ></CardDataStats>
          <CardDataStats
            title="Total Earned"
            total={store?.formattedTotalEarned}
          ></CardDataStats>
        </div>
        <GameChart />
        <div className="mb-5.5" />
        <div className="col-span-12 xl:col-span-12">
          <OrderTable title="Recent Orders" />
        </div>
      </div>
    </>
  );
};

export default AffiliateDashboard;
