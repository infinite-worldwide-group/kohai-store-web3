"use client";

import { useRouter } from "next/navigation";

interface SwapButtonProps {
  className?: string;
}

/**
 * Swap Button - Opens in-app swap page
 * Works with Reown embedded wallets
 */
export default function SwapButton({ className }: SwapButtonProps) {
  const router = useRouter();

  const handleSwap = () => {
    router.push('/swap');
  };

  return (
    <button
      onClick={handleSwap}
      className={className || "flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:from-purple-600 hover:to-blue-600"}
      title="Swap tokens"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      Swap Tokens
    </button>
  );
}
