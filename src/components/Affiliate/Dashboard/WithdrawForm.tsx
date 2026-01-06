"use client";

import Loader from "@/components/common/Loader";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { useStore } from "@/contexts/StoreContext";
import {
  useAffiliateBankAccountsQuery,
  useCreateWithdrawMutation,
} from "graphql/generated/graphql";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const WithdrawForm = () => {
  const { store, setStore } = useStore();
  const { affiliate, setAffiliate } = useAffiliate();
  const router = useRouter();

  const [bankAccountId, setBankAccountId] = useState<string | undefined>();

  const defaultValues = {
    amount: 0,
  };

  const { data } = useAffiliateBankAccountsQuery({
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.currentAffiliate.defaultBank) {
        setBankAccountId(data.currentAffiliate.defaultBank.id);
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: defaultValues,
  });

  const [createWithdraw, { loading }] = useCreateWithdrawMutation({
    onCompleted: (data) => {
      if (data?.createWithdrawRequest?.errors) {
        alert(data?.createWithdrawRequest?.errors[0].detail);
      }
      if (data?.createWithdrawRequest?.affiliate) {
        setAffiliate(data.createWithdrawRequest.affiliate);
      }
      if (data?.createWithdrawRequest?.gamecreditStore) {
        setStore(data.createWithdrawRequest.gamecreditStore);
        alert(
          "Withdraw request submitted successfully, please allow processing time 3-7 working days.",
        );
        setValue("amount", 0);
        router.push('/store/transactions');
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSubmit = (variables: any) => {
    if (!bankAccountId) {
      return;
    }

    createWithdraw({
      variables: {
        amount: Number(variables.amount),
        bankAccountId: bankAccountId,
      },
    });
  };

  if (!affiliate?.affiliateWallet) return <Loader />;

  const canSubmit = !!bankAccountId && Number(watch("amount")) > 0;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5.5 grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Recipient Bank Account
            </label>
            {data?.currentAffiliate.defaultBank ? (
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="cursor-pointer w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 p-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
              >
                {data?.currentAffiliate.bankAccounts.map((bank) => (
                  <option key={`banks-${bank.id}`} value={bank.id}>{bank.bankName} - {bank.bankAccountNumber}</option>
                ))}
              </select>
            ) : (
              <p>You don't have any saved bank accounts yet.</p>
            )}
            <Link href="/store/bank-accounts/new">
              <div className="btn mb-4 mt-2 cursor-pointer text-yellow-500 hover:underline">
                Add bank account »
              </div>
            </Link>

            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Withdraw Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 opacity-70">
                {store?.fiatCurrency.symbol}
              </span>
              <input
                disabled={loading}
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 px-4.5 py-3 pl-12 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                type="number"
                autoFocus
                defaultValue={watch("amount")}
                {...register("amount", {
                  required: "Amount is required",
                })}
              />
            </div>
            <div className="grid grid-cols-2 pt-2">
              <p className="text-sm">Available balance:</p>
              <p className="text-right text-sm">
                {affiliate.affiliateWallet.formattedAmount}
              </p>
            </div>
            <div className="mt-3 flex justify-end gap-4.5">
              <button
                className={`flex justify-center rounded  px-6 py-2 font-medium text-gray hover:bg-opacity-90 ${loading || !canSubmit ? "bg-gray-500" : "bg-primary"}`}
                type="submit"
                disabled={loading || !canSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default WithdrawForm;
