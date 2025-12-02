"use client";

import { useAffiliate } from "@/contexts/AffiliateContext";
import { useStore } from "@/contexts/StoreContext";
import { useUser } from "@/contexts/UserContext";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useAffiliateLoginMutation } from "graphql/generated/graphql";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

const StoreSignIn: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser();
  const { setAffiliate } = useAffiliate();
  const { setStore } = useStore();

  const [jwtToken, setJwtToken] = useLocalStorage<string | null>(
    "jwtToken",
    null,
  );

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  // GraphQL Mutation
  const [signIn] = useAffiliateLoginMutation({
    onCompleted: (data) => {
      if (data && data.affiliateLogin) {
        const { jwt, user, affiliate, gamecreditStore, errors } =
          data.affiliateLogin;

        if (!!jwt && user && affiliate && gamecreditStore) {
          setJwtToken(jwt);
          setUser(user);
          setAffiliate(affiliate);
          setStore(gamecreditStore);
          router.push("/store/dashboard");
        } else if (errors && errors.length > 0) {
          alert("error: " + errors[0].detail);
        }
      }
    },
    onError: (e) => {
      alert(e.message);
    },
  });

  type SignInVariables = {
    email: string;
    password: string;
    name: string;
  };

  const logout = async () => {
    await setUser(null);
    await setAffiliate(null);
    await setStore(null);
    await window.localStorage.removeItem("jwtToken");
  };

  const onSubmit = (variables: SignInVariables) => {
    logout();

    signIn({
      variables: {
        ...variables,
      },
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-boxdark">
      <div className="w-full max-w-lg rounded-lg border border-stroke bg-white p-10 shadow-xl dark:border-strokedark dark:bg-boxdark">
        {/* Logo and Welcome Message */}
        <div className="mb-10 text-center">
          <Link href="/">
            <Image
              className="mx-auto"
              src="/images/logo.png"
              alt="Logo"
              width={176}
              height={32}
            />
          </Link>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Sign in with your Kohai account to access your Game
            Credit Affiliate Dashboard.
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter store name"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-white">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-form-input dark:text-white"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-6 py-4 text-white transition duration-300 hover:bg-opacity-90"
          >
            Sign In
          </button>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Please contact Kohai if you cannot find your password
          </p>
        </form>
      </div>
    </div>
  );
};

export default StoreSignIn;
