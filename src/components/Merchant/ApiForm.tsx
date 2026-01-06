"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const ApiForm = () => {
  const { merchant } = useMerchant();
  if (!merchant) return null;

  const [showKeys, setShowKeys] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const onSuccessAuth = () => {
    setShowKeys(true);
  };

  return (
    <>
      <form action="#">
        <div className="mb-5.5 ">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Merchant ID
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-stroke bg-gray p-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type={showKeys ? "text" : "password"}
              defaultValue={merchant.merchantId}
              disabled
            />
          </div>
        </div>
        <div className="mb-5.5 ">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Secret Key
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-stroke bg-gray p-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type={showKeys ? "text" : "password"}
              defaultValue={merchant.secretKey}
              disabled
            />
          </div>
        </div>
        <div className="mb-5.5 ">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Callback Key
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-stroke bg-gray p-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type={showKeys ? "text" : "password"}
              defaultValue={merchant.callbackKey}
              disabled
            />
          </div>
        </div>
        <div className="mb-5.5 ">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Callback Url
          </label>
          <div className="relative">
            <input
              className="w-full rounded border border-stroke bg-gray p-4.5 py-3 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              type="text"
              defaultValue={merchant.callbackUrl ?? ""}
            />
          </div>
        </div>
        <div className="flex justify-end gap-4.5">
          <div
            className="flex cursor-pointer justify-center rounded bg-gray-300 px-6 py-2 font-medium text-gray-600 hover:bg-opacity-90"
            onClick={() => (!showKeys ? setShowAuth(true) : setShowKeys(false))}
          >
            {showKeys ? "Hide Keys" : "View Keys"}
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

export default ApiForm;
