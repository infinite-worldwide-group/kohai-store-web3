"use client";
import { useCurrentMerchantOrderStatsQuery } from "graphql/generated/graphql";
import React from "react";
import CardDataStats from "../CardDataStats";
import Loader from "../common/Loader";
import GameChart from "./GameChart";
import OrderTable from "./OrderTable";

const ECommerce: React.FC = () => {
  const { data, loading } = useCurrentMerchantOrderStatsQuery({
    onError: (e) => {
      console.log(e);
    },
  });

  if (!data || loading) return <Loader />;

  const {
    succeededOrders,
    failedOrders,
    pendingOrders,
    refundedOrders,
    succeededOrdersChange,
    failedOrdersChange,
    pendingOrdersChange,
    refundedOrdersChange,
    topupProductPercentage,
  } = data.currentMerchant;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Succeeded"
          total={succeededOrders}
          rate={`${succeededOrdersChange}%`}
          levelUp={succeededOrdersChange > 0}
          levelDown={succeededOrdersChange < 0}
        ></CardDataStats>
        <CardDataStats
          title="Processing"
          total={pendingOrders}
          rate={`${pendingOrdersChange}%`}
          levelUp={pendingOrdersChange > 0}
          levelDown={pendingOrdersChange < 0}
        ></CardDataStats>
        <CardDataStats
          title="Failed"
          total={failedOrders}
          rate={`${failedOrdersChange}%`}
          levelUp={failedOrdersChange > 0}
          levelDown={failedOrdersChange < 0}
        ></CardDataStats>
        <CardDataStats
          title="Refunded"
          total={refundedOrders}
          rate={`${refundedOrdersChange}%`}
          levelUp={refundedOrdersChange > 0}
          levelDown={refundedOrdersChange < 0}
        ></CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <GameChart />
        <div className="col-span-12 xl:col-span-12">
          <OrderTable title="Recent Orders" />
        </div>
      </div>
    </>
  );
};

export default ECommerce;
