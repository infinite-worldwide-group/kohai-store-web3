"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/types/topup";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  amount: number;
  isProcessing: boolean;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  onSelectMethod,
  amount,
  isProcessing,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  if (!isOpen) return null;

  const handleSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setTimeout(() => {
      onSelectMethod(method);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        {/* Modal Content */}
        <div className="rounded-lg bg-gradient-to-b from-gray-900 to-black border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Select Payment Method</h2>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-gray-400 hover:text-white transition disabled:opacity-50"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-400 mt-2">
              Choose how you want to top up ${amount.toFixed(2)} USDT
            </p>
          </div>

          {/* Payment Options */}
          <div className="p-6 space-y-4">
            {/* Option 1: Crypto Payment */}
            <button
              onClick={() => handleSelect('crypto')}
              disabled={isProcessing}
              className={`w-full rounded-lg border-2 p-6 text-left transition ${
                selectedMethod === 'crypto'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Option 1: Pay with Crypto
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Send crypto from your wallet using QR code or address
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                      ⚡ Solana
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                      Ξ Ethereum
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-300">
                      🔶 BSC
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-300">
                      🔺 Avalanche
                    </span>
                  </div>
                </div>
                {selectedMethod === 'crypto' && (
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>

            {/* Option 2: Fiat Payment (Meld) */}
            <button
              onClick={() => handleSelect('meld')}
              disabled={isProcessing}
              className={`w-full rounded-lg border-2 p-6 text-left transition ${
                selectedMethod === 'meld'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-white/10 bg-white/5 hover:border-green-500/50 hover:bg-green-500/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Option 2: Pay with FPX / Card
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Pay with FPX, credit card, or bank transfer (fiat currency)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300">
                      🏦 FPX (Malaysia)
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300">
                      💳 Credit/Debit Card
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                      🏦 Bank Transfer
                    </span>
                  </div>
                  <p className="text-xs text-green-400 mt-2">
                    ✓ Instant conversion to SOL USDT
                  </p>
                </div>
                {selectedMethod === 'meld' && (
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-purple-200/80">
                <strong className="text-purple-300">Secure Payment:</strong> All transactions are encrypted and processed securely. Your funds will be credited automatically once payment is confirmed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
