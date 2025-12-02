"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import {
  useMerchantWhitelistsQuery,
  useUpdateWhitelistsMutation,
} from "graphql/generated/graphql";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Loader from "../common/Loader";
import AuthModal from "./AuthModal";

const WhitelistForm = () => {
  const { merchant } = useMerchant();
  if (!merchant) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    defaultValues: {
      whitelists: merchant.whitelists,
    },
  });

  const [showAuth, setShowAuth] = useState(false);

  const { data, loading, refetch } = useMerchantWhitelistsQuery();

  const [updateWhitelists] = useUpdateWhitelistsMutation({
    onCompleted: (data) => {
      if (data?.updateWhitelists?.success) {
        refetch();
        alert("Whitelists updated");
      }
    },
    onError: (e) => {
      alert(e);
    },
  });

  const onSuccessAuth = () => {
    updateWhitelists({
      variables: {
        whitelists: watch("whitelists"),
      },
    });
  };

  if (!data || loading) return <Loader />;

  return (
    <>
      <form action="#">
        <div className="mb-5.5 ">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Whitelists
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-stroke bg-gray p-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              defaultValue={data.currentMerchant.whitelists}
              {...register("whitelists", {
                required: "Whitelists is required",
              })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4.5">
          <div
            className="flex cursor-pointer justify-center rounded bg-gray-300 px-6 py-2 font-medium text-gray-600 hover:bg-opacity-90"
            onClick={() => setShowAuth(true)}
          >
            Update
          </div>
        </div>
      </form>

      <AuthModal
        showAuth={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={onSuccessAuth}
      />
    </>
  );
};

export default WhitelistForm;
