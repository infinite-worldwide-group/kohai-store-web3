"use client";

import { useState } from 'react';
import {
  useGetReferralCodeQuery,
  useGetReferralStatsQuery,
  useClaimEarningsMutation,
} from 'graphql/generated/graphql';

interface ReferralSectionProps {
  onClose?: () => void;
}

const ReferralSection = ({ onClose }: ReferralSectionProps) => {
  const { data: referralCodeData, loading: loadingCode } = useGetReferralCodeQuery();
  const { data: statsData, loading: loadingStats, refetch: refetchStats } = useGetReferralStatsQuery();
  const [claimEarnings, { loading: claiming }] = useClaimEarningsMutation();
  const [copySuccess, setCopySuccess] = useState(false);

  const referralCode = referralCodeData?.referralCode?.code;
  const stats = statsData?.referralStats;
  const claimableEarnings = stats?.claimableEarnings || 0;
  const totalEarnings = stats?.totalEarnings || 0;
  const totalReferrals = stats?.totalReferrals || 0;

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleClaimEarnings = async () => {
    try {
      const result = await claimEarnings();

      if (result.data?.claimEarnings?.errors && result.data.claimEarnings.errors.length > 0) {
        alert(result.data.claimEarnings.errors.join(', '));
      } else if (result.data?.claimEarnings?.message) {
        alert(result.data.claimEarnings.message);
        refetchStats(); // Refresh stats after claiming
      }
    } catch (error) {
      console.error('Error claiming earnings:', error);
      alert('Failed to claim earnings. Please try again.');
    }
  };

  if (loadingCode || loadingStats) {
    return (
      <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-purple-400 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-purple-300">Loading referral info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
        <h3 className="text-sm font-bold text-purple-300">Referral Rewards</h3>
      </div>

      {/* Referral Code */}
      <div className="mb-3">
        <p className="text-xs text-gray-400 mb-2">Your Referral Code</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-white/5 px-3 py-2 font-mono text-lg font-bold text-white">
            {referralCode || 'Loading...'}
          </div>
          <button
            onClick={handleCopyCode}
            className="rounded-lg bg-purple-500/20 px-3 py-2 text-sm font-medium text-purple-300 transition hover:bg-purple-500/30"
            title="Copy referral code"
          >
            {copySuccess ? (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {totalReferrals} {totalReferrals === 1 ? 'person' : 'people'} used your code
        </p>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-xs text-gray-400">Claimable</p>
          <p className="text-sm font-bold text-green-400">
            {claimableEarnings.toFixed(2)} USDT
          </p>
        </div>
        <div className="rounded-lg bg-white/5 p-2">
          <p className="text-xs text-gray-400">Total Earned</p>
          <p className="text-sm font-bold text-purple-300">
            {totalEarnings.toFixed(2)} USDT
          </p>
        </div>
      </div>

      {/* Claim Button */}
      <button
        onClick={handleClaimEarnings}
        disabled={claiming || claimableEarnings === 0}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition ${
          claimableEarnings > 0 && !claiming
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {claiming ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming...
          </span>
        ) : claimableEarnings > 0 ? (
          `Claim ${claimableEarnings.toFixed(2)} USDT`
        ) : (
          'No Earnings to Claim'
        )}
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        Share your code to earn commission on referrals!
      </p>
    </div>
  );
};

export default ReferralSection;
