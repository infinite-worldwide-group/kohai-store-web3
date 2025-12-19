"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/contexts/WalletContext";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useRouter, useSearchParams } from "next/navigation";

const SignUpContent: React.FC = () => {
  const { isConnected, address, connect, isConnecting } = useWallet();
  const { hasPendingCode, getPendingCode } = useReferralCode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasCheckedRef, setHasCheckedRef] = useState(false);
  const pendingCode = hasPendingCode() ? getPendingCode() : null;

  // Debug: Log on mount to check if component loads
  useEffect(() => {
    console.log('🔍 SignUp page loaded');
    console.log('📍 Current URL params:', {
      searchParams: searchParams ? Object.fromEntries(searchParams.entries()) : 'null',
      href: typeof window !== 'undefined' ? window.location.href : 'SSR'
    });
  }, [searchParams]);

  // ALWAYS redirect to referral page if ref code is in URL
  useEffect(() => {
    if (!searchParams) {
      console.log('⏳ Waiting for searchParams to load...');
      return;
    }

    if (hasCheckedRef) return; // Already checked

    const refCode = searchParams.get('ref');
    console.log('🔍 Checking for ref code:', refCode);
    
    if (refCode) {
      console.log('✅ Found referral code:', refCode);
      console.log('🔄 Redirecting to /auth/referral?ref=' + refCode);
      setHasCheckedRef(true);
      
      // Use replace to avoid back button issues
      router.replace(`/auth/referral?ref=${encodeURIComponent(refCode)}`);
    } else {
      console.log('ℹ️ No referral code in URL');
      setHasCheckedRef(true);
    }
  }, [searchParams, hasCheckedRef, router]);

  // Redirect to home after successful connection (but not if there's a ref code)
  useEffect(() => {
    // Don't redirect to home if there's a ref code in URL - let the ref redirect happen first
    const refCode = searchParams?.get('ref');
    if (refCode) {
      console.log('⏭️ Skipping home redirect because ref code is present');
      return;
    }

    if (isConnected && address && hasCheckedRef) {
      setShowSuccess(true);

      // Redirect after a short delay to show success message
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, address, hasCheckedRef, searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
          <Link href="/">
            <Image
              className="mx-auto"
              src="/images/logo/logo.svg"
              alt="Logo"
              width={176}
              height={32}
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Welcome to Kohai Store
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Connect your wallet to get started
          </p>
        </div>

        {/* Referral Code Badge */}
        {pendingCode && (
          <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Referral Code Applied</p>
                <p className="text-xs text-purple-300/90 font-mono">{pendingCode}</p>
              </div>
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-purple-200/70 mt-2">
              You'll receive a 10% discount voucher after connecting your wallet!
            </p>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="rounded-lg bg-green-500/20 border border-green-500/30 p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-400">Wallet Connected Successfully!</p>
                <p className="text-xs text-green-300/70">Redirecting you to the store...</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Required Notice */}
        {!isConnected && (
          <div className="rounded-lg bg-orange-500/20 border border-orange-500/30 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-300">Login Required</p>
                <p className="text-xs text-orange-200/80 mt-1">
                  You need to connect your wallet first to continue
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connect Wallet Section */}
        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 py-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {isConnecting ? (
                <>
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
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Connect Wallet to Login
                </>
              )}
            </button>

            <div className="space-y-3 rounded-lg bg-white/5 p-4 text-sm text-gray-300">
              <p className="font-semibold text-white">How it works:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Click "Connect Wallet to Login" above</li>
                <li>Select your Solana wallet (Phantom, Solflare, etc.)</li>
                <li>Approve the connection in your wallet</li>
                {pendingCode && <li className="text-purple-300">Your referral code will be applied automatically</li>}
                <li>Start shopping with crypto!</li>
              </ol>
            </div>

            <div className="space-y-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs font-semibold text-blue-300">Don't have a Solana wallet?</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium transition"
                >
                  <span>Get Phantom</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://solflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-medium transition"
                >
                  <span>Get Solflare</span>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>We'll never access your wallet without permission</span>
            </div>
          </div>
        ) : null}

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have a wallet connected?{' '}
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition">
            Go to Store
          </Link>
        </p>
      </div>
    </div>
  );
};

const SignUp: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
};

export default SignUp;
