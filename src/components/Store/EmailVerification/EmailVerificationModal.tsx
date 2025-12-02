"use client";

import { useState, useCallback, useEffect } from "react";

interface EmailVerificationModalProps {
  currentEmail?: string | null;
  emailVerified?: boolean;
  onVerified: () => void;
  onClose: () => void;
  mandatory?: boolean; // Force user to complete verification before closing
}

export default function EmailVerificationModal({
  currentEmail,
  emailVerified,
  onVerified,
  onClose,
  mandatory = false,
}: EmailVerificationModalProps) {
  const [step, setStep] = useState<"email" | "otp" | "verified">(
    currentEmail && !emailVerified ? "otp" : "email"
  );
  const [email, setEmail] = useState(currentEmail || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Allow ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [onClose]);

  const handleSendCode = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql";
      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          query: `
            mutation SendEmailVerificationCode($email: String!) {
              sendEmailVerificationCode(email: $email) {
                success
                message
                errors
              }
            }
          `,
          variables: { email },
        }),
      });

      const { data } = await response.json();

      if (data?.sendEmailVerificationCode?.success) {
        setSuccess(data.sendEmailVerificationCode.message || "Verification code sent!");
        setStep("otp");
        setCountdown(60); // 60 seconds cooldown
      } else if (data?.sendEmailVerificationCode?.errors) {
        setError(data.sendEmailVerificationCode.errors.join(", "));
      } else {
        setError("Failed to send verification code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleVerifyCode = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3000/graphql";
      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        body: JSON.stringify({
          query: `
            mutation VerifyEmail($code: String!) {
              verifyEmail(code: $code) {
                success
                message
                errors
                user {
                  id
                  email
                  emailVerified
                  emailVerifiedAt
                }
              }
            }
          `,
          variables: { code: otp },
        }),
      });

      const { data } = await response.json();

      if (data?.verifyEmail?.success) {
        setSuccess(data.verifyEmail.message || "Email verified successfully!");
        setStep("verified");

        // Dispatch custom event to notify all components to refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('email-verified'));
        }

        setTimeout(() => {
          onVerified();
          onClose();
        }, 2000);
      } else if (data?.verifyEmail?.errors) {
        setError(data.verifyEmail.errors.join(", "));
      } else {
        setError("Failed to verify code");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify code");
    } finally {
      setLoading(false);
    }
  }, [otp, onVerified, onClose]);

  const handleChangeEmail = useCallback(async () => {
    setStep("email");
    setOtp("");
    setError(null);
    setSuccess(null);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        // Allow closing by clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            {step === "email" && "Enter Your Email"}
            {step === "otp" && "Verify Your Email"}
            {step === "verified" && "Email Verified!"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-white"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mandatory Notice */}
        {mandatory && step !== "verified" && (
          <div className="mb-4 rounded-lg bg-orange-500/10 border border-orange-500/30 p-3">
            <p className="text-xs text-orange-300">
              ⚠️ <strong>Verification Required:</strong> Email verification is required to make purchases.
            </p>
            <p className="text-xs text-orange-200/70 mt-1">
              This reminder will reappear in 1 minute if not completed.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 p-3">
            <p className="text-sm text-green-300">{success}</p>
          </div>
        )}

        {/* Step: Enter Email */}
        {step === "email" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
              <p className="text-sm text-blue-300">
                <strong>📧 Email Required for Purchases</strong>
              </p>
              <p className="text-sm text-gray-300 mt-1">
                We need your email to send order updates, receipts, and delivery confirmations.
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && email && !loading) {
                    handleSendCode();
                  }
                }}
                placeholder="your@email.com"
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-blue-400"
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading || !email}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        )}

        {/* Step: Enter OTP */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
              <p className="text-sm text-blue-300">
                <strong>📬 Check Your Email</strong>
              </p>
              <p className="text-sm text-gray-300 mt-1">
                We sent a 6-digit verification code to <strong>{email}</strong>
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Verification Code *</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otp.length === 6 && !loading) {
                    handleVerifyCode();
                  }
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-center text-2xl font-mono text-white tracking-widest placeholder-white/40 outline-none ring-1 ring-white/20 transition focus:ring-2 focus:ring-blue-400"
                disabled={loading}
                autoFocus
              />
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </button>

            {/* Resend / Change Email */}
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={handleSendCode}
                disabled={loading || countdown > 0}
                className="text-blue-400 transition hover:text-blue-300 disabled:text-gray-500"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </button>
              <button
                onClick={handleChangeEmail}
                disabled={loading}
                className="text-gray-400 transition hover:text-white disabled:text-gray-600"
              >
                Change Email
              </button>
            </div>
          </div>
        )}

        {/* Step: Verified */}
        {step === "verified" && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <svg
                className="h-12 w-12 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">Email Verified Successfully!</p>
            <p className="mt-2 text-sm text-gray-400">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
