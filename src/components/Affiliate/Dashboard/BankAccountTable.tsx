"use client";
import Loader from "@/components/common/Loader";
import {
  useAffiliateBankAccountsQuery,
  useRemoveBankAccountMutation,
  useSetDefaultBankMutation,
} from "graphql/generated/graphql";
import Link from "next/link";
import { FiEdit, FiTrash } from "react-icons/fi";
import { MdOutlineStar, MdOutlineStarBorder } from "react-icons/md";

const BankAccountTable = (props: { limit?: number; title?: string }) => {
  const { data, loading } = useAffiliateBankAccountsQuery({
    fetchPolicy: "cache-and-network",
    onError: (e) => {
      console.log(e);
    },
  });

  const [setDefault] = useSetDefaultBankMutation({
    onCompleted: () => {
      window.location.reload();
    },
  });

  const [removeBank] = useRemoveBankAccountMutation({
    onCompleted: (data) => {
      alert(data?.removeAffiliateBankAccount?.message)
      window.location.reload();
    },
  });

  if (!data || loading) return <Loader />;

  const colTitles = [
    "Bank Name",
    "Account No.",
    "Acc Holder",
    "Currency",
    "Status",
    "Default",
    "Action",
  ];

  const { bankAccounts } = data.currentAffiliate;

  return (
    <>
      {bankAccounts.length > 0 ? (
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
                {bankAccounts.map((bankAccount, key) => (
                  <tr
                    className="border-b border-gray-700 odd:bg-gray-900 even:bg-gray-800"
                    key={key}
                  >
                    <td className="px-6 py-4">{bankAccount.bankName}</td>
                    <td className="px-6 py-4">
                      {bankAccount.bankAccountNumber}
                    </td>
                    <td className="px-6 py-4">{bankAccount.name}</td>
                    <td className="px-6 py-4">
                      {bankAccount.fiatCurrency?.isoCode}
                    </td>
                    <td
                      className={`px-6 py-4 ${bankAccount.state == "active" ? "text-green-500" : undefined}`}
                    >
                      {bankAccount.state}
                    </td>
                    <td className="px-6 py-4">
                      {bankAccount.isDefault ? "Default" : "-"}
                    </td>
                    <td className="flex gap-2 px-6 py-4">
                      <button
                        className="cursor-pointer hover:text-yellow-500"
                        onClick={() => removeBank({
                          variables: {
                            bankAccountId: bankAccount.id
                          }
                        })}
                        title="Edit"
                      >
                        <FiTrash />
                      </button>
                      <button
                        className="cursor-pointer hover:text-yellow-500"
                        onClick={() =>
                          setDefault({
                            variables: {
                              bankAccountId: bankAccount.id,
                              isDefault: bankAccount.isDefault ? false : true,
                            },
                          })
                        }
                        title="Set default"
                      >
                        {bankAccount.isDefault ? (
                          <MdOutlineStar size={20} color="yellow" />
                        ) : (
                          <MdOutlineStarBorder size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <h2 className="my-6">No bank accounts added yet</h2>
      )}
      <Link href="/store/bank-accounts/new">
        <p className="my-3 text-sm text-yellow-500 hover:underline">
          + Add bank account
        </p>
      </Link>
    </>
  );
};

export default BankAccountTable;
