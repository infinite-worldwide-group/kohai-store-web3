"use client";

import { useMerchant } from "@/contexts/MerchantContext";
import { useMerchantAuthMutation } from "graphql/generated/graphql";
import { useForm } from "react-hook-form";

const AuthModal = (props: {
  showAuth: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const { merchant } = useMerchant();
  if (!merchant || !props.showAuth) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      password: "",
    },
  });

  const [merchantAuth] = useMerchantAuthMutation({
    onCompleted: (data) => {
      if (data && data.merchantAuth?.success) {
        props.onSuccess();
        props.onClose();
      }
    },
  });

  const onSubmit = (variables: any) => {
    merchantAuth({
      variables: {
        ...variables,
      },
    });
  };

  return (
    <div
      id="auth-modal"
      aria-hidden="true"
      className="modal fixed inset-0 z-99999 flex items-center justify-center overflow-y-auto"
    >
      <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]"></div>
      <div className="relative max-h-full w-full max-w-2xl p-4">
        {/* <!-- Modal content --> */}
        <div className="relative rounded-lg bg-white shadow-sm dark:bg-gray-700">
          {/* <!-- Modal header --> */}
          <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-600 md:p-5">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Authentication needed
            </h3>
            <button
              type="button"
              className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={props.onClose}
            >
              <svg
                className="h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <!-- Modal body --> */}
            <div className="space-y-4 p-4 md:p-5">
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
            {/* <!-- Modal footer --> */}
            <div className="flex items-center rounded-b border-t border-gray-200 p-4 dark:border-gray-600 md:p-5">
              <button
                type="button"
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={handleSubmit(onSubmit)}
              >
                Submit
              </button>
              <button
                onClick={props.onClose}
                type="button"
                className="ms-3 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
