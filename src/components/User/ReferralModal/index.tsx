"use client";

import { useState } from 'react';
import {
  useGetReferralCodeQuery,
  useGetReferralStatsQuery,
  useClaimEarningsMutation,
  useApplyReferralCodeMutation,
  useCurrentUserQuery,
} from 'graphql/generated/graphql';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralModal = ({ isOpen, onClose }: ReferralModalProps) => {
  const { data: currentUserData } = useCurrentUserQuery();
  const { data: referralCodeData, loading: loadingCode, error: errorCode } = useGetReferralCodeQuery({
    skip: !isOpen,
  });
  const { data: statsData, loading: loadingStats, refetch: refetchStats, error: errorStats } = useGetReferralStatsQuery({
    skip: !isOpen,
  });
  const [claimEarnings, { loading: claiming }] = useClaimEarningsMutation();
  const [applyReferralCode, { loading: applying }] = useApplyReferralCodeMutation();

  const [copySuccess, setCopySuccess] = useState(false);
  const [showApplyCode, setShowApplyCode] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Debug logging
  console.log('🔍 Referral Modal Data:', {
    referralCodeData,
    statsData,
    errorCode,
    errorStats
  });

  const referralCode = referralCodeData?.referralCode?.code;
  const stats = statsData?.referralStats;
  const claimableEarnings = stats?.claimableEarnings || 0;
  const totalEarnings = stats?.totalEarnings || 0;
  const claimedEarnings = stats?.claimedEarnings || 0;
  const totalReferrals = stats?.totalReferrals || 0;
  const recentEarnings = stats?.recentEarnings || [];
  
  // The code they applied from someone else (if any)
  // This should be DIFFERENT from referralCode which is THEIR own code
  const appliedReferralCode = stats?.appliedCode || stats?.referredBy || null;

  // Check if user has already applied a referral code
  // The backend tracks this - users can only apply ONE code ever
  const hasAppliedReferralCode = appliedReferralCode !== null && appliedReferralCode !== undefined;

  // Debug logging
  console.log('Referral codes:', {
    yourCode: referralCode,
    codeYouApplied: appliedReferralCode,
    stats: stats
  });

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const text = `Join me and get 10% off your first purchase! Use referral code: ${referralCode}`;
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleClaimEarnings = async () => {
    try {
      const result = await claimEarnings();

      if (result.data?.claimEarnings?.errors && result.data.claimEarnings.errors.length > 0) {
        alert(result.data.claimEarnings.errors.join(', '));
      } else if (result.data?.claimEarnings?.message) {
        alert(result.data.claimEarnings.message);
        refetchStats();
      }
    } catch (error) {
      console.error('Error claiming earnings:', error);
      alert('Failed to claim earnings. Please try again.');
    }
  };

  const handleApplyCode = async () => {
    if (!referralCodeInput.trim()) {
      alert('Please enter a referral code');
      return;
    }

    // Prevent applying own code
    if (referralCodeInput.toUpperCase() === referralCode?.toUpperCase()) {
      alert('You cannot apply your own referral code');
      return;
    }

    try {
      const result = await applyReferralCode({
        variables: { code: referralCodeInput.toUpperCase() }
      });

      if (result.data?.applyReferralCode?.errors && result.data.applyReferralCode.errors.length > 0) {
        alert(result.data.applyReferralCode.errors.join(', '));
      } else if (result.data?.applyReferralCode?.message) {
        alert(result.data.applyReferralCode.message);
        setShowApplyCode(false);
        setReferralCodeInput('');
        refetchStats();
      }
    } catch (error) {
      console.error('Error applying referral code:', error);
      alert('Failed to apply referral code. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-gray-900 border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 p-2">
              <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Referral Rewards</h2>
              <p className="text-sm text-gray-400">Earn commissions by inviting friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Your Referral Code */}
          <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Your Referral Code</h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 rounded-lg bg-black/30 px-4 py-3 font-mono text-2xl font-bold text-white text-center">
                {loadingCode ? 'Loading...' : referralCode || (referralCodeData ? JSON.stringify(referralCodeData) : 'N/A')}
              </div>
              <button
                onClick={handleCopyCode}
                className="rounded-lg bg-purple-500 px-4 py-3 text-white font-semibold hover:bg-purple-600 transition"
              >
                {copySuccess ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={handleShareTwitter}
                className="flex-1 rounded-lg bg-blue-500/20 border border-blue-500/30 px-4 py-2 text-sm font-medium text-blue-300 hover:bg-blue-500/30 transition"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?ref=${referralCode}`;
                  navigator.clipboard.writeText(url);
                  alert('Referral link copied!');
                }}
                className="flex-1 rounded-lg bg-green-500/20 border border-green-500/30 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-500/30 transition"
              >
                Copy Link
              </button>
            </div>

            <p className="text-center text-sm text-gray-400">
              {totalReferrals} {totalReferrals === 1 ? 'person' : 'people'} used your code
            </p>
          </div>

          {/* Earnings Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Claimable</p>
              <p className="text-2xl font-bold text-green-400">
                {loadingStats ? '...' : `${claimableEarnings.toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-500">USDT</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-blue-400">
                {loadingStats ? '...' : `${totalEarnings.toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-500">USDT</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 p-4">
              <p className="text-sm text-gray-400 mb-1">Claimed</p>
              <p className="text-2xl font-bold text-purple-400">
                {loadingStats ? '...' : `${claimedEarnings.toFixed(2)}`}
              </p>
              <p className="text-xs text-gray-500">USDT</p>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaimEarnings}
            disabled={claiming || claimableEarnings === 0}
            className={`w-full rounded-lg px-6 py-3 text-lg font-bold transition ${
              claimableEarnings > 0 && !claiming
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/50'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claiming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Claiming...
              </span>
            ) : claimableEarnings > 0 ? (
              `💰 Claim ${claimableEarnings.toFixed(2)} USDT`
            ) : (
              'No Earnings to Claim'
            )}
          </button>

          {/* Apply Referral Code Section */}
          <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 p-4">
            {hasAppliedReferralCode ? (
              // Show which code they already used (read-only)
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h4 className="font-semibold text-green-300">✓ Redeemed</h4>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 px-4 py-3">
                  <p className="text-xs text-green-300 mb-2 text-center font-semibold">Referral Code Used</p>
                  <p className="font-mono text-2xl font-bold text-white text-center tracking-wider">
                    {loadingStats ? 'Loading...' : appliedReferralCode || 'N/A'}
                  </p>
                </div>
                <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <svg className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-green-300">Welcome voucher received!</p>
                    <p className="text-xs text-green-200/70 mt-1">
                      You received a 10% discount voucher when you applied this code. Check your active vouchers in checkout!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Show apply code form (only if they haven't applied one yet)
              !showApplyCode ? (
                <button
                  onClick={() => setShowApplyCode(true)}
                  className="w-full flex items-center justify-center gap-2 text-orange-300 hover:text-orange-200 transition"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Have a referral code? Click to apply
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-orange-300">Apply Referral Code</h4>
                    <button
                      onClick={() => {
                        setShowApplyCode(false);
                        setReferralCodeInput('');
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character code"
                    maxLength={8}
                    className="w-full rounded-lg bg-black/30 border border-orange-500/30 px-4 py-2 font-mono text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCode}
                    disabled={applying || referralCodeInput.length !== 8}
                    className={`w-full rounded-lg px-4 py-2 font-semibold transition ${
                      referralCodeInput.length === 8 && !applying
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {applying ? 'Applying...' : 'Apply Code & Get 10% Off'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    ⚠️ You can only apply one referral code per account
                  </p>
                </div>
              )
            )}
          </div>

          {/* Recent Earnings */}
          {recentEarnings.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Recent Earnings</h3>
              <div className="space-y-2">
                {recentEarnings.slice(0, 5).map((earning: any, index: number) => (
                  <div
                    key={earning.id || index}
                    className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {earning.commissionPercent}% commission
                      </p>
                      <p className="text-xs text-gray-400">
                        Order: {earning.orderAmount} {earning.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        +{earning.commissionAmount} {earning.currency}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{earning.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
            <h4 className="font-semibold text-blue-300 mb-2">How it works</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Share your code with friends</li>
              <li>• They get 10% off their first purchase</li>
              <li>• You earn commission based on your tier (1-3%)</li>
              <li>• Claim your earnings anytime!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;
