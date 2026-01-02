"use client";

import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "next/navigation";

/**
 * Mobile Swap Button - Floating Action Button (FAB)
 * Appears on mobile screens for easy access to swap functionality
 */
export default function MobileSwapButton() {
  const { isConnected } = useWallet();
  const router = useRouter();

  const handleSwap = () => {
    router.push('/swap');
  };

  // Only show on mobile when wallet is connected
  if (!isConnected) return null;

  return (
    <button
      onClick={handleSwap}
      className="md:hidden fixed bottom-20 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-4 shadow-lg transition hover:from-purple-600 hover:to-blue-600 hover:scale-110"
      title="Swap tokens"
      aria-label="Swap tokens"
    >
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
      <span className="text-white font-semibold text-sm">Swap</span>
    </button>
  );
}
