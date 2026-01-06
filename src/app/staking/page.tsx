"use client";

import { useState } from "react";
import { useStaking } from "@/hooks/useStaking";
import { useWallet } from "@/contexts/WalletContext";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export default function StakingPage() {
  const { isConnected, connect } = useWallet();
  const { stats, loading, error, isReady, stake, unstake, claimRewards } =
    useStaking();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  const handleStake = async () => {
    if (!stakeAmount || isNaN(Number(stakeAmount))) {
      setTxError("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    setTxError(null);
    setTxSuccess(null);

    try {
      const signature = await stake(Number(stakeAmount));
      setTxSuccess(`Successfully staked ${stakeAmount} KOHAI! Tx: ${signature}`);
      setStakeAmount("");
    } catch (err: any) {
      setTxError(err.message || "Failed to stake tokens");
    } finally {
      setProcessing(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || isNaN(Number(unstakeAmount))) {
      setTxError("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    setTxError(null);
    setTxSuccess(null);

    try {
      const signature = await unstake(Number(unstakeAmount));
      setTxSuccess(
        `Successfully unstaked ${unstakeAmount} KOHAI! Tx: ${signature}`
      );
      setUnstakeAmount("");
    } catch (err: any) {
      setTxError(err.message || "Failed to unstake tokens");
    } finally {
      setProcessing(false);
    }
  };

  const handleClaimRewards = async () => {
    setProcessing(true);
    setTxError(null);
    setTxSuccess(null);

    try {
      const signature = await claimRewards();
      setTxSuccess(`Successfully claimed rewards! Tx: ${signature}`);
    } catch (err: any) {
      setTxError(err.message || "Failed to claim rewards");
    } finally {
      setProcessing(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Unlocked";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="KOHAI Staking" />

      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h1 className="mb-2 text-3xl font-bold text-black dark:text-white">
            KOHAI Token Staking
          </h1>
          <p className="text-body dark:text-bodydark">
            Stake your KOHAI tokens to earn rewards. The longer you stake, the
            more you earn.
          </p>
        </div>

        {!isConnected ? (
          <div className="rounded-sm border border-stroke bg-white p-10 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="mb-4 text-2xl font-semibold text-black dark:text-white">
              Connect Your Wallet
            </h2>
            <p className="mb-6 text-body dark:text-bodydark">
              Please connect your wallet to start staking KOHAI tokens
            </p>
            <button
              onClick={connect}
              className="inline-flex items-center justify-center rounded-md bg-primary px-10 py-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            {isReady && stats && (
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="mb-2 text-sm font-medium text-body dark:text-bodydark">
                    Total Staked
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {stats.totalStaked.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    KOHAI
                  </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="mb-2 text-sm font-medium text-body dark:text-bodydark">
                    Your Staked
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {stats.userStaked.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    KOHAI
                  </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="mb-2 text-sm font-medium text-body dark:text-bodydark">
                    Pending Rewards
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {stats.pendingRewards.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    KOHAI
                  </div>
                </div>

                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="mb-2 text-sm font-medium text-body dark:text-bodydark">
                    APY
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-white">
                    {(stats.apy * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {(error || txError) && (
              <div className="mb-4 rounded-sm border border-danger bg-danger bg-opacity-10 p-4">
                <p className="text-danger">{error || txError}</p>
              </div>
            )}

            {txSuccess && (
              <div className="mb-4 rounded-sm border border-success bg-success bg-opacity-10 p-4">
                <p className="text-success">{txSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Stake Card */}
              <div className="rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
                  Stake KOHAI
                </h2>

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    disabled={processing || loading}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleStake}
                  disabled={processing || loading || !isReady}
                  className="w-full rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
                >
                  {processing ? "Processing..." : "Stake"}
                </button>

                {stats && stats.lockPeriod > 0 && (
                  <p className="mt-4 text-sm text-body dark:text-bodydark">
                    Lock period: {Math.floor(stats.lockPeriod / 86400)} days
                  </p>
                )}
              </div>

              {/* Unstake Card */}
              <div className="rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
                  Unstake KOHAI
                </h2>

                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount to unstake"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    disabled={processing || loading || !stats?.canUnstake}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={
                    processing || loading || !isReady || !stats?.canUnstake
                  }
                  className="w-full rounded-lg bg-danger p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
                >
                  {processing ? "Processing..." : "Unstake"}
                </button>

                {stats && !stats.canUnstake && (
                  <p className="mt-4 text-sm text-danger">
                    {formatTimeRemaining(stats.timeUntilUnlock)}
                  </p>
                )}
              </div>
            </div>

            {/* Claim Rewards Card */}
            {stats && stats.pendingRewards > 0 && (
              <div className="mt-8 rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="mb-2 text-2xl font-semibold text-black dark:text-white">
                      Claim Your Rewards
                    </h2>
                    <p className="text-body dark:text-bodydark">
                      You have{" "}
                      <span className="font-bold text-success">
                        {stats.pendingRewards.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        KOHAI
                      </span>{" "}
                      ready to claim
                    </p>
                  </div>
                  <button
                    onClick={handleClaimRewards}
                    disabled={processing || loading || !isReady}
                    className="rounded-lg bg-success px-8 py-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
                  >
                    {processing ? "Processing..." : "Claim Rewards"}
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-8 rounded-sm border border-stroke bg-white p-10 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
                <p className="mt-4 text-body dark:text-bodydark">
                  Loading staking data...
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}
