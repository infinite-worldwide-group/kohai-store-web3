import { ApexOptions } from "apexcharts";
import { useGameChartQuery } from "graphql/generated/graphql";
import dynamic from "next/dynamic";
import React from "react";
import Loader from "../common/Loader";

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
    show: true,
    position: "bottom",
    horizontalAlign: "center",
    fontFamily: "Satoshi, sans-serif",
    fontSize: "14px",
    markers: {
      radius: 12,
    },
    itemMargin: {
      horizontal: 8,
      vertical: 5,
    },
    onItemClick: {
      toggleDataSeries: true,
    },
    onItemHover: {
      highlightDataSeries: true,
    },
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
        legend: {
          show: true,
          position: "bottom",
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          show: true,
          position: "bottom",
          fontSize: "12px",
        },
      },
    },
  ],
};

const GameChart: React.FC = () => {
  const { data, loading } = useGameChartQuery();

  if (!data || loading) return <Loader />;

  const { topupProductPercentage } = data.currentMerchant;
  const series = topupProductPercentage.map((i) => i.percentage);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Game Chart
          </h5>
        </div>
      </div>

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
              <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                <span> {i.productName} </span>
                <span> {i.percentage}% </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameChart;
