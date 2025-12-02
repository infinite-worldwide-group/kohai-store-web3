import { ApexOptions } from "apexcharts";
import { useStoreGameChartQuery } from "graphql/generated/graphql";
import dynamic from "next/dynamic";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF"],
  labels: ["Desktop", "Tablet", "Mobile", "Unknown"],
  legend: {
    show: false,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

const GameChart: React.FC = () => {
  const { data, loading } = useStoreGameChartQuery();

  if (!data || loading) return null;

  const { topupProductPercentage } = data.currentStore;
  const series = topupProductPercentage.map((i) => i.percentage);

  return (
    <div className="col-span-12 rounded-sm border border-strokedark bg-boxdark px-5 pb-5 pt-7.5 shadow-default sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-white">Game Chart</h5>
        </div>
      </div>

      {data.currentStore.topupProductPercentage.length > 0 ? (
        <>
          <div className="mb-2">
            <div id="chartThree" className="mx-auto flex justify-center">
              <ReactApexChart options={options} series={series} type="donut" />
            </div>
          </div>

          <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
            {topupProductPercentage.map((i, index) => (
              <div className="w-full px-8 sm:w-1/2" key={`game-${index}`}>
                <div className="flex w-full items-center">
                  <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-primary"></span>
                  <p className="flex w-full justify-between text-sm font-medium text-white">
                    <span> {i.productName} </span>
                    <span> {i.percentage}% </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>No sales yet</p>
      )}
    </div>
  );
};

export default GameChart;
