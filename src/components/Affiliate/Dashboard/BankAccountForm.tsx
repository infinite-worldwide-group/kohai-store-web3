"use client";

import Loader from "@/components/common/Loader";
import { useAffiliate } from "@/contexts/AffiliateContext";
import { useStore } from "@/contexts/StoreContext";
import { useBankNamesQuery, useCreateBankAccountMutation } from "graphql/generated/graphql";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

const BankAccountForm = () => {
  const { affiliate } = useAffiliate();

  const router = useRouter();

  const { data, loading: loadingBanks } = useBankNamesQuery({
    onCompleted: data => {
      if (data?.bankNames) {
        setValue('bankName', data.bankNames[0].label)
      }
    }
  });

  const defaultValues = {
    name: "",
    bankName: "",
    bankAccountNumber: "",
    isDefault: true,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: defaultValues,
  });

  const [createBankAccount, { loading }] = useCreateBankAccountMutation({
    onCompleted: (data) => {
      if (data?.createAffiliateBankAccount?.errors) {
        alert(data?.createAffiliateBankAccount?.errors[0].detail);
      }
      if (data?.createAffiliateBankAccount?.bankAccount) {
        router.push('/store/bank-accounts');
        alert("Bank created successfully");
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSubmit = (variables: any) => {
    createBankAccount({
      variables: {
        ...variables,
      },
    });
  };

  if (!affiliate?.affiliateWallet) return <Loader />;

  const canSubmit =
    !!watch("bankAccountNumber") && !!watch("bankName") && !!watch("name");

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5.5 grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Bank Name
            </label>
            <select
              value={watch('bankName')}
              onChange={(e) => setValue('bankName', e.target.value)}
              className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 p-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
            >
              {data?.bankNames.map((bank) => (
                <option value={bank.label} key={`bank-${bank.id}`}>{bank.label}</option>
              ))}
            </select>
            
            <div className="mb-4"></div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Bank Account Number
            </label>
            <div className="relative">
              <input
                disabled={loading}
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 px-4.5 py-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                autoFocus
                defaultValue={watch("bankAccountNumber")}
                {...register("bankAccountNumber", {
                  required: "Bank Account number is required",
                })}
              />
            </div>

            <div className="mb-4"></div>
            <label
              className="mb-3 block text-sm font-medium text-white"
              htmlFor="headerColor"
            >
              Account Holder Name
            </label>
            <div className="relative">
              <input
                disabled={loading}
                className="w-full rounded border border-stroke border-strokedark bg-gray bg-meta-4 px-4.5 py-3 text-white focus:border-primary focus:border-primary focus-visible:outline-none"
                autoFocus
                defaultValue={watch("name")}
                {...register("name", {
                  required: "Holder full name is required",
                })}
              />
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

export default BankAccountForm;
