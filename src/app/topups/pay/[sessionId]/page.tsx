"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWallet } from "@/contexts/WalletContext";
import StoreLayout from "@/components/Layouts/StoreLayout";
import Loader from "@/components/common/Loader";
import type { PaymentSession } from "@/types/topup";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { isConnected } = useWallet();

  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Network icons mapping
  const networkIcons: Record<string, string> = {
    solana: "⚡",
    ethereum: "Ξ",
    bsc: "🔶",
    avalanche: "🔺",
    tron: "🔷",
  };

  // Network chain IDs for reference
  const networkChainIds: Record<string, number> = {
    ethereum: 1,
    bsc: 56,
    avalanche: 43114,
  };

  // Network names for display
  const networkNames: Record<string, string> = {
    solana: "Solana",
    ethereum: "Ethereum",
    bsc: "Binance Smart Chain (BSC)",
    avalanche: "Avalanche C-Chain",
    tron: "Tron",
  };

  // Fetch session details
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/topup/session/${sessionId}`);
        const data = await response.json();

        if (data.success && data.session) {
          setSession(data.session);
          // Generate QR code with plain address only (larger size for better scanning)
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data.session.depositAddress)}`;
          setQrCodeUrl(qrUrl);
        } else {
          setError(data.error || "Payment session not found");
        }
      } catch (err: any) {
        console.error("Error fetching session:", err);
        setError(err.message || "Failed to load payment session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Poll for transaction status
  useEffect(() => {
    if (!session || session.status !== "pending") return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/topup/session/${sessionId}`);
        const data = await response.json();

        if (data.success && data.session) {
          setSession(data.session);

          // If completed, stop polling
          if (data.session.status === "completed") {
            clearInterval(pollInterval);
            // Show success notification
            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Error polling session:", err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [session, sessionId, router]);

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (session?.depositAddress) {
      navigator.clipboard.writeText(session.depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Submit transaction hash for verification
  const handleVerifyTransaction = async () => {
    if (!txHash || !sessionId) return;

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/topup/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          txHash,
        }),
      });

      const data = await response.json();

      if (data.success && data.verified) {
        // Update session status
        const updatedSession = { ...session!, status: "completed" as const };
        setSession(updatedSession);

        // Show success and redirect
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.errors?.join(", ") || "Transaction verification failed");
      }
    } catch (err: any) {
      console.error("Error verifying transaction:", err);
      setError(err.message || "Failed to verify transaction");
    } finally {
      setIsVerifying(false);
    }
  };

  // Format time remaining
  const getTimeRemaining = () => {
    if (!session) return "";
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <StoreLayout>
        <Loader />
      </StoreLayout>
    );
  }

  if (error && !session) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => router.push("/topups")}
              className="mt-4 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30"
            >
              Back to Topup
            </button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!session) return null;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Complete Payment</h1>
          <p className="text-gray-400">
            Scan the QR code or copy the address to send your payment
          </p>
        </div>

        {/* Status Banner */}
        {session.status === "completed" && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-400">Payment Received!</h3>
                <p className="text-sm text-green-300/80">Your balance has been updated. Redirecting...</p>
              </div>
            </div>
          </div>
        )}

        {session.status === "expired" && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-400">Payment Expired</h3>
                <p className="text-sm text-red-300/80">This payment session has expired. Please create a new one.</p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* QR Code */}
          <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Scan QR Code</h2>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-3">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Payment QR Code" className="w-80 h-80" />
                ) : (
                  <div className="w-80 h-80 flex items-center justify-center bg-gray-200">
                    <Loader />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 text-center">
                Scan with your {networkNames[session.network] || session.network} wallet
              </p>
              <p className="text-xs text-blue-400 text-center mt-2">
                Your Wallet Address
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Payment Information</h2>

            {/* Network */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Network</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{networkIcons[session.network]}</span>
                <span className="text-lg font-semibold text-white">{networkNames[session.network] || session.network}</span>
              </div>
              {networkChainIds[session.network] && (
                <p className="text-xs text-gray-500">Chain ID: {networkChainIds[session.network]}</p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Amount to Send</p>
              <p className="text-2xl font-bold text-white">
                {session.amount} {session.token}
              </p>
            </div>

            {/* Address */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Topup Destination</p>
              <p className="text-xs text-blue-400 mb-2">Your Wallet Address</p>
              <div className="bg-black/30 rounded-lg p-3 mb-2 break-all font-mono text-sm text-white border border-white/10">
                {session.depositAddress}
              </div>
              <button
                onClick={handleCopyAddress}
                className="w-full rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500/30"
              >
                {copied ? "✓ Copied!" : "📋 Copy Your Address"}
              </button>
            </div>

            {/* Time Remaining */}
            {session.status === "pending" && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Time Remaining</p>
                <p className="text-lg font-semibold text-orange-400">{getTimeRemaining()}</p>
              </div>
            )}

            {/* Session ID */}
            <div>
              <p className="text-xs text-gray-400 mb-1">Session ID</p>
              <p className="text-xs font-mono text-gray-500">{session.sessionId}</p>
            </div>
          </div>
        </div>

        {/* Manual Transaction Verification */}
        {session.status === "pending" && (
          <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Already Sent Payment?</h2>
            <p className="text-sm text-gray-400 mb-4">
              If you've already sent the payment, enter your transaction hash to verify it immediately:
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Enter transaction hash"
                className="flex-1 rounded-lg bg-black/30 border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={handleVerifyTransaction}
                disabled={!txHash || isVerifying}
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>
        )}

        {/* Instructions */}
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
                Important Instructions
              </h3>
              <ol className="text-sm text-purple-200/80 space-y-2 list-decimal list-inside">
                <li>
                  <strong>Select the correct network in your wallet:</strong>
                  {networkChainIds[session.network] ? (
                    <span> {networkNames[session.network]} (Chain ID: {networkChainIds[session.network]})</span>
                  ) : (
                    <span> {networkNames[session.network] || session.network}</span>
                  )}
                </li>
                <li>Send exactly <strong>{session.amount} {session.token}</strong> to <strong>your wallet address</strong> shown above</li>
                <li>This is a direct topup to your own wallet</li>
                <li>Transaction confirmation typically takes 5-15 minutes</li>
                <li>Your wallet balance will update automatically once confirmed</li>
                <li>This payment link expires in 60 minutes</li>
              </ol>
              {session.network !== "solana" && (
                <p className="text-sm text-purple-200/80 mt-3">
                  <strong>Cross-Chain Topup:</strong> You are topping up {session.token} on {networkNames[session.network] || session.network} directly to your wallet.
                  The funds will be available in your wallet once the transaction is confirmed on the blockchain.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
