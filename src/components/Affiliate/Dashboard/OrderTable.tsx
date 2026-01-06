"use client";
import Loader from "@/components/common/Loader";
import { useAffiliateOrdersQuery } from "graphql/generated/graphql";
import { useState } from "react";

const OrderTable = (props: { limit?: number; title?: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [endOfPage, setEndOfPage] = useState(false);
  const limit = props.limit ?? 5;

  // Pagination Handlers
  const nextPage = () => !endOfPage && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const { data, loading } = useAffiliateOrdersQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      page: currentPage,
      limit: limit,
    },
    onCompleted: (data) => {
      if (data?.affiliateOrders.count) {
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

  const colTitles = [
    "Order Number",
    "Item",
    "User Data",
    "Selling Price",
    "Cost Price",
    "Earned",
    "Status",
  ];

  if (data.affiliateOrders.count < 1) return <h1>No orders yet</h1>;

  const { data: orders, count } = data.affiliateOrders;

  const totalPages = Math.ceil(count / limit);

  return (
    <div className="rounded-sm border border-stroke border-strokedark bg-boxdark p-0 shadow-default">
      {!!props.title && (
        <h4 className="mb-6 px-5 pt-3 text-xl font-semibold text-white">
          {props.title}
        </h4>
      )}
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400 rtl:text-right">
          {/* Table Headers */}
          <thead className="bg-gray-700 text-xs uppercase text-gray-400">
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
                className="border-b border-gray-700 odd:bg-gray-900 even:bg-gray-800"
                key={key}
              >
                <td className="px-6 py-4">{order.orderNumber}</td>
                <td className="px-6 py-4">
                  {order.item}
                  {!!order.errorMessage &&
                    ["refunded", "failed"].includes(order.status) && (
                      <p className="text-red-500">{order.errorMessage}</p>
                    )}
                </td>
                {order.userData ? (
                  <td className="px-6 py-4">
                    <p>{order.email}</p>
                    {order.userData.map((userData: any, index: number) => (
                      <p key={`userdata-${index}`}>
                        <strong>{userData.name}:</strong> {userData.value}
                      </p>
                    ))}
                  </td>
                ) : (
                  <td>
                    <p>-</p>
                  </td>
                )}
                <td className="px-6 py-4">{order.formattedAmount}</td>
                <td className="px-6 py-4">{order.formattedOriginalAmount}</td>
                <td className="px-6 py-4">{order.formattedTotalEarned}</td>
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
      <div className="flex justify-between p-4">
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
