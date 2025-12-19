"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useReferralCode } from "@/hooks/useReferralCode";
import { useWallet } from "@/contexts/WalletContext";
import { useUser } from "@/contexts/UserContext";

const ReferralPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getPendingCode, clearPendingCode } = useReferralCode();
  const { isConnected, address, connect, isConnecting } = useWallet();
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState<string>("");
  const [customCode, setCustomCode] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [codeConfirmed, setCodeConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user already has a referral code applied
  const hasAppliedReferral = user?.appliedReferralCode;

  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/referral?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    // Get referral code from URL or localStorage
    const urlCode = searchParams?.get('ref');
    const pendingCode = getPendingCode();

    console.log('🔍 Referral page loaded');
    console.log('📍 URL Code:', urlCode);
    console.log('💾 Pending Code (localStorage):', pendingCode);

    if (urlCode) {
      const upperCode = urlCode.toUpperCase();
      console.log('✅ Setting referral code from URL:', upperCode);
      setReferralCode(upperCode);
      
      // 🔑 AUTO-STORE: Automatically save the referral code from URL to localStorage
      // This ensures the code is persisted even if the user navigates away
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingReferralCode', upperCode);
        console.log('✅ Referral code from URL auto-stored:', upperCode);
      }
    } else if (pendingCode) {
      console.log('✅ Using pending code from localStorage:', pendingCode);
      setReferralCode(pendingCode);
    } else {
      console.log('⚠️ No referral code found in URL or localStorage');
    }
  }, [searchParams, getPendingCode]);

  // Don't auto-confirm - require user to click "Confirm & Continue"
  // This ensures users explicitly agree to use the referral code

  // Redirect to home after wallet connection
  useEffect(() => {
    if (isConnected && address && codeConfirmed) {
      setConfirmed(true);

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [isConnected, address, codeConfirmed, router]);

  const handleConfirm = () => {
    const codeToUse = useCustom ? customCode.toUpperCase() : referralCode;

    if (!codeToUse) {
      alert("Please enter a referral code");
      return;
    }

    // Store the selected code in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingReferralCode', codeToUse);
      console.log('✅ Referral code confirmed and stored:', codeToUse);
    }

    setCodeConfirmed(true);

    // If already connected, the ReferralCodeHandler will try to apply it
    // and will show an error if it's their own code
  };

  const handleSkip = () => {
    // Clear any pending referral code
    clearPendingCode();

    // If already connected, go to home, otherwise go to signup
    if (isConnected) {
      router.push('/');
    } else {
      router.push('/auth/signup');
    }
  };

  const selectedCode = useCustom ? customCode.toUpperCase() : referralCode;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
        {/* Back to Homepage Button */}
        <div className="flex justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </Link>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            Referral Code
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Confirm your referral code to get exclusive rewards
          </p>
        </div>

        {confirmed ? (
          // Final Success Message
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg bg-green-500/20 border border-green-500/30 p-6 text-center">
              <svg className="h-16 w-16 text-green-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold text-green-400 mb-2">All Set!</h3>
              <p className="text-sm text-green-300/80 mb-2">
                Wallet Connected & Referral Code Applied
              </p>
              <p className="text-xs text-green-200/70">
                Code: <span className="font-mono font-bold">{selectedCode}</span>
              </p>
              <p className="text-xs text-green-200/70 mt-3">
                Redirecting you to the store...
              </p>
            </div>
          </div>
        ) : codeConfirmed && !isConnected ? (
          // Step 2: Wallet Connection (after code confirmation)
          <div className="space-y-6 animate-fade-in">
            {/* Code Confirmed Badge */}
            <div className="rounded-lg bg-green-500/20 border border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-400">Referral Code Confirmed</p>
                  <p className="text-xs text-green-300/80 font-mono">{selectedCode}</p>
                </div>
              </div>
            </div>

            {/* Login Required Notice */}
            <div className="rounded-lg bg-orange-500/20 border border-orange-500/30 p-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-300">Now Connect Your Wallet</p>
                  <p className="text-xs text-orange-200/80 mt-1">
                    Login to activate your referral rewards
                  </p>
                </div>
              </div>
            </div>

            {/* Connect Wallet Button */}
            <button
              onClick={connect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-3 py-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {isConnecting ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

            {/* Wallet Instructions */}
            <div className="space-y-3 rounded-lg bg-white/5 p-4 text-sm text-gray-300">
              <p className="font-semibold text-white">How it works:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Click "Connect Wallet to Login" above</li>
                <li>Select your Solana wallet (Phantom, Solflare, etc.)</li>
                <li>Approve the connection in your wallet</li>
                <li>Your referral code will be applied automatically</li>
                <li>Start shopping with your 10% discount!</li>
              </ol>
            </div>

            {/* Get Wallet Links */}
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
          </div>
        ) : (
          // Step 1: Referral Code Confirmation
          // Referral Code Selection
          <div className="space-y-6">
            {/* Referral Code Display */}
            {referralCode && !useCustom && (
              <div className="rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-6">
                <div className="text-center">
                  <svg className="h-12 w-12 text-purple-400 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <p className="text-sm text-purple-200/70 mb-2">Your Referral Code</p>
                  <p className="text-3xl font-bold font-mono text-white mb-4 tracking-wider">
                    {referralCode}
                  </p>

                  {/* Copy Referral Link Button */}
                  <button
                    onClick={copyReferralLink}
                    className="mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all mx-auto"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-green-400 font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-purple-300 font-medium">Copy Referral Link</span>
                      </>
                    )}
                  </button>

                  <div className="space-y-2 text-left bg-white/5 rounded-lg p-4">
                    <p className="text-xs font-semibold text-purple-200">Benefits:</p>
                    <ul className="text-xs text-purple-100/80 space-y-1">
                      <li className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Get a 10% discount voucher on your first purchase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Automatically applied after wallet connection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Exclusive access to special promotions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Code Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-600"></div>
                <button
                  onClick={() => setUseCustom(!useCustom)}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {useCustom ? "Use provided code" : "Have a different code?"}
                </button>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

              {useCustom && (
                <div className="animate-fade-in">
                  <label className="block mb-2 text-sm font-medium text-white">
                    Enter Referral Code
                  </label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="Enter code here"
                    className="w-full p-4 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                    maxLength={20}
                  />
                  {customCode && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Code will be applied: <span className="font-mono font-bold text-purple-400">{customCode}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Already Applied Referral Notice */}
            {hasAppliedReferral && (
              <div className="rounded-lg bg-yellow-500/20 border border-yellow-500/30 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-yellow-300">Already Linked Referral</p>
                    <p className="text-xs text-yellow-200/80 mt-1">
                      You have already used referral code: <span className="font-mono font-bold">{hasAppliedReferral}</span>
                    </p>
                    <p className="text-xs text-yellow-200/60 mt-2">
                      Each account can only use one referral code.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={!selectedCode || !!hasAppliedReferral}
                className="w-full flex items-center justify-center gap-3 py-4 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale font-semibold text-lg"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {hasAppliedReferral ? 'Already Linked Referral' : 'Confirm & Continue'}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-3 text-gray-400 hover:text-white transition text-sm font-medium"
              >
                {hasAppliedReferral ? 'Back to Homepage' : 'Skip and continue without referral code'}
              </button>
            </div>

            {/* Info Boxes */}
            <div className="space-y-3">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-300 mb-1">What happens next?</p>
                    <p className="text-xs text-blue-200/70">
                      After confirming, you'll be asked to connect your Solana wallet. The referral code will be automatically applied to your account after wallet connection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-yellow-300 mb-1">Important Note</p>
                    <p className="text-xs text-yellow-200/70">
                      You cannot use your own referral code. Please use a code shared by another user to receive your discount.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

const ReferralPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ReferralPageContent />
    </Suspense>
  );
};

export default ReferralPage;
