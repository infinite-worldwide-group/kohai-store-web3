"use client";
import CardDataStats from "@/components/CardDataStats";
import Loader from "@/components/common/Loader";
import {
  AffiliateTransactionState,
  useAffiliateTransactionsQuery,
} from "graphql/generated/graphql";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";
import TransactionFilter from "./TransactionFilter";

const TransactionTable = (props: { limit?: number; title?: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [endOfPage, setEndOfPage] = useState(false);
  const limit = props.limit ?? 5;

  const [transactionType, setTransactionType] = useState<string | undefined>();
  const [states, setStates] = useState<
    AffiliateTransactionState[] | undefined
  >();

  // Pagination Handlers
  const nextPage = () => !endOfPage && setCurrentPage((prev) => prev + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((prev) => prev - 1);

  const { data, loading } = useAffiliateTransactionsQuery({
    fetchPolicy: "cache-and-network",
    variables: {
      page: currentPage,
      limit: limit,
      transactionType: transactionType,
      states: states,
    },
    onCompleted: (data) => {
      if (data?.affiliateTransactions.count) {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [transactionType, states]);

  if (!data || loading) return <Loader />;

  const colTitles = ["Date", "Item", "User Data", "Amount", "Type", "Status"];

  const {
    data: transactions,
    count,
    formattedBalance,
    formattedTotalEarned,
  } = data.affiliateTransactions;

  const totalPages = Math.ceil(count / limit);

  return (
    <>
      <div className="mb-5.5 grid w-full grid-cols-2 gap-4">
        <CardDataStats
          title="Balance"
          total={formattedBalance}
          action={
            <Link href="/store/withdraw">
              <div className="rounded bg-primary px-3 py-1 text-xs font-medium text-white">
                Cash Out
              </div>
            </Link>
          }
        ></CardDataStats>
        <CardDataStats
          title="Total Earned"
          total={formattedTotalEarned}
        ></CardDataStats>
      </div>

      <TransactionFilter
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        states={states}
        setStates={setStates}
      />

      {transactions.length > 0 ? (
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
                {transactions.map((transaction, key) => (
                  <tr
                    className="border-b border-gray-700 odd:bg-gray-900 even:bg-gray-800"
                    key={key}
                  >
                    <td className="px-6 py-4">
                      {moment(transaction.createdAt).format()}
                    </td>
                    {transaction.affiliateOrder ? (
                      <td className="px-6 py-4">
                        {transaction.affiliateOrder?.item}
                        {!!transaction.affiliateOrder?.errorMessage &&
                          ["refunded", "failed"].includes(
                            transaction.affiliateOrder?.status,
                          ) && (
                            <p className="text-red-500">
                              {transaction.affiliateOrder?.errorMessage}
                            </p>
                          )}
                      </td>
                    ) : (
                      <td className="px-6 py-4">{transaction?.item}</td>
                    )}

                    {transaction.affiliateOrder?.userData ? (
                      <td className="px-6 py-4">
                        <p>{transaction.affiliateOrder?.email}</p>
                        {transaction.affiliateOrder?.userData.map(
                          (userData: any, index: number) => (
                            <p key={`userdata-${index}`}>
                              <strong>{userData.name}:</strong> {userData.value}
                            </p>
                          ),
                        )}
                      </td>
                    ) : (
                      <td>
                        <p>-</p>
                      </td>
                    )}
                    <td
                      className={`px-6 py-4 ${transaction.isWithdrawal && transaction.state == AffiliateTransactionState.Completed && "text-red-500"} ${transaction.state == AffiliateTransactionState.Pending && "text-yellow-500"}`}
                    >
                      {transaction.isWithdrawal && "-"}
                      {transaction.formattedAmount}
                    </td>
                    <td className="px-6 py-4">{transaction.transactionType}</td>
                    <td
                      className={`px-6 py-4 ${
                        transaction.state ===
                        AffiliateTransactionState.Completed
                          ? "text-green-500"
                          : transaction.state ===
                              AffiliateTransactionState.Pending
                            ? "text-yellow-500"
                            : transaction.state ===
                                AffiliateTransactionState.Failed
                              ? "text-red-500"
                              : "text-gray-500"
                      }`}
                    >
                      {transaction.state}
                      {!!transaction.rejectReasons && (
                        <p className="text-sm text-red-500">{transaction.rejectReasons}</p>
                      )}
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
      ) : (
        <h2 className="my-6">No transactions yet</h2>
      )}
    </>
  );
};

export default TransactionTable;
