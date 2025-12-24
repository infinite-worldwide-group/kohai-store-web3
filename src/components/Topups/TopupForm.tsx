"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import Loader from "@/components/common/Loader";
import type { Network, CreatePaymentSessionResponse } from "@/types/topup";

const TopupForm = () => {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("solana");
  const [amount, setAmount] = useState<string>("");
  const [walletInitialized, setWalletInitialized] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Define available networks for topup
  const networks: Network[] = [
    {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      icon: "⚡",
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      icon: "Ξ",
    },
    {
      id: "bsc",
      name: "Binance Smart Chain",
      symbol: "BNB",
      icon: "🔶",
    },
    {
      id: "avalanche",
      name: "Avalanche",
      symbol: "AVAX",
      icon: "🔺",
    },
    {
      id: "tron",
      name: "Tron",
      symbol: "TRX",
      icon: "🔷",
    },
  ];

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Wait for wallet context to initialize and authenticate
  useEffect(() => {
    if (mounted) {
      // Give wallet more time to initialize and authenticate
      const timer = setTimeout(() => {
        setWalletInitialized(true);
      }, 1000); // Increased from 500ms to 1000ms
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Check authentication status and wait for wallet to connect
  useEffect(() => {
    if (!mounted || !walletInitialized) return;

    let authTimeout: NodeJS.Timeout;

    const checkAuth = () => {
      console.log('Checking auth - isConnected:', isConnected, 'address:', address);

      if (isConnected && address) {
        // Wallet is connected - stop authenticating
        console.log('Wallet connected!');
        setIsAuthenticating(false);
        if (authTimeout) clearTimeout(authTimeout);
      } else {
        // Wallet not connected yet - wait up to 3 seconds total
        console.log('Waiting for wallet connection...');
        authTimeout = setTimeout(() => {
          // After 3 seconds, if still not connected, stop loading
          // Don't redirect - just show connect wallet message
          console.log('Timeout - showing page anyway');
          setIsAuthenticating(false);
        }, 3000);
      }
    };

    checkAuth();

    return () => {
      if (authTimeout) clearTimeout(authTimeout);
    };
  }, [mounted, walletInitialized, isConnected, address]);

  // Listen for wallet connection changes
  useEffect(() => {
    if (isConnected && address && isAuthenticating) {
      console.log('Wallet connected during auth - stopping auth spinner');
      setIsAuthenticating(false);
    }
  }, [isConnected, address, isAuthenticating]);

  // Handle create payment session
  const handleCreateSession = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!selectedNetworkId) {
      setError("Please select a network");
      return;
    }

    setIsCreatingSession(true);
    setError("");

    try {
      const response = await fetch("/api/topup/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": address || "",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          network: selectedNetworkId,
          token: "USDT",
        }),
      });

      const data: CreatePaymentSessionResponse = await response.json();

      if (data.success && data.session) {
        // Redirect to payment page
        router.push(`/topups/pay/${data.session.sessionId}`);
      } else {
        setError(data.errors?.join(", ") || "Failed to create payment session");
      }
    } catch (err: any) {
      console.error("Error creating payment session:", err);
      setError(err.message || "Failed to create payment session");
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Show loader while mounting, initializing wallet, or authenticating
  if (!mounted || !walletInitialized || isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader />
        <p className="text-gray-400 mt-4">
          {!mounted ? "Loading..." : !walletInitialized ? "Initializing wallet..." : "Connecting to wallet..."}
        </p>
      </div>
    );
  }

  // Show connect wallet message if not connected (don't redirect)
  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-8 text-center">
          <svg
            className="h-16 w-16 mx-auto mb-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-3">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the topup feature.
          </p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
          >
            Go to Home & Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Topup Your Wallet</h1>
        <p className="text-gray-400">
          Add funds to your wallet by transferring crypto from any supported network.
          All deposits are automatically converted to SOL USDT.
        </p>
      </div>

      {/* Amount Input */}
      <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Enter Amount</h2>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <div className="text-gray-400 font-semibold">USDT</div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Minimum: $10 USDT
        </p>
      </div>

      {/* Network Selection */}
      <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Select Network</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => setSelectedNetworkId(network.id)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                selectedNetworkId === network.id
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <span className="text-2xl">{network.icon}</span>
              <div className="text-left">
                <p className="font-semibold text-white">{network.name}</p>
                <p className="text-xs text-gray-400">{network.symbol}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Generate Payment Button */}
      <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6 mb-6">
        <button
          onClick={handleCreateSession}
          disabled={isCreatingSession || !amount || parseFloat(amount) <= 0}
          className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 text-lg font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingSession ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Payment...
            </div>
          ) : (
            "Generate Payment QR Code"
          )}
        </button>
      </div>

      {/* Auto-Conversion Notice */}
      <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-2">
              How It Works
            </h3>
            <ol className="text-sm text-purple-200/80 space-y-2 list-decimal list-inside">
              <li>Enter the amount you want to top up</li>
              <li>Select your preferred network</li>
              <li>Click "Generate Payment QR Code"</li>
              <li>Scan the QR code with your wallet or copy the address</li>
              <li>Send the exact amount to the provided address</li>
              <li>Your balance will be updated automatically (5-15 minutes)</li>
            </ol>
            <p className="text-sm text-purple-200/80 mt-3">
              <strong>Note:</strong> All deposits from other networks are automatically converted to SOL USDT at the current market rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopupForm;
