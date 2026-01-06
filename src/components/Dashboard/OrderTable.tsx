"use client";
import { useMerchantOrdersQuery } from "graphql/generated/graphql";
import { useState } from "react";
import Loader from "../common/Loader";

const OrderTable = (props: { limit?: number; title?: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [endOfPage, setEndOfPage] = useState(false);
  const limit = props.limit ?? 5;

  // Pagination Handlers
  const nextPage = () => !endOfPage && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const { data, loading } = useMerchantOrdersQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      page: currentPage,
      limit: limit,
    },
    onCompleted: (data) => {
      if (data?.merchantOrders.count) {
        const totalPages = Math.ceil(count / limit);
        if (currentPage == totalPages) {
          setEndOfPage(true);
        } else {
          setEndOfPage(false);
        }
      }
    },
    onError: (e) => {
      console.log(e);
    },
  });

  if (!data || loading) return <Loader />;

  const colTitles = ["Reference No.", "Item", "User Data", "Amount", "Status"];

  const { data: orders, count } = data.merchantOrders;

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {!!props.title && (
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          {props.title}
        </h4>
      )}
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          {/* Table Headers */}
          <thead className="bg-gray-200 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              {colTitles.map((title, index) => (
                <th scope="col" className="px-6 py-3" key={index}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {orders.map((order, key) => (
              <tr
                className="border-b border-gray-200 odd:bg-white even:bg-gray-100 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800"
                key={key}
              >
                <td className="px-6 py-4">{order.trackingNumber}</td>
                <td className="px-6 py-4">{order.item}</td>
                {order.userData ? (
                  <td className="px-6 py-4">
                    {Object.entries(order.userData).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong>{" "}
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value)}
                      </p>
                    ))}
                  </td>
                ) : (
                  <p>No user data available.</p>
                )}
                <td className="px-6 py-4">{order.displayAmount}</td>
                <td
                  className={`px-6 py-4 ${
                    order.status === "succeeded"
                      ? "text-green-500"
                      : order.status === "pending"
                        ? "text-yellow-500"
                        : order.status === "failed"
                          ? "text-red-500"
                          : order.status === "refunded"
                            ? "text-orange-500"
                            : "text-gray-500"
                  }`}
                >
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className={`rounded border px-4 py-2 ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200"}`}
        >
          Previous
        </button>

        <span className="flex items-center">{`Page ${currentPage} of ${totalPages}`}</span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className={`rounded border px-4 py-2 ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-200"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrderTable;
