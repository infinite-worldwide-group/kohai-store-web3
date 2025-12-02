"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const SignUp: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-boxdark">
        <div className="text-center">
          <Link href="/">
            <Image
              className="dark:hidden mx-auto"
              src="/images/logo/logo-dark.svg"
              alt="Logo"
              width={176}
              height={32}
            />
            <Image
              className="hidden dark:block mx-auto"
              src="/images/logo/logo.svg"
              alt="Logo"
              width={176}
              height={32}
            />
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-black dark:text-white">
            Sign Up to TailAdmin
          </h2>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-black dark:text-white">
              Name
            </label>
            <input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-black dark:text-white">
              Email
            </label>
            <input
              type="email"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-black dark:text-white">
              Password
            </label>
            <input
              type="password"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-black dark:text-white">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 text-white bg-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Create Account
          </button>

          <p className="mt-6 text-center text-sm text-black dark:text-white">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
