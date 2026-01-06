"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppKitProvider } from "@reown/appkit/react";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { StakingClient } from "@/lib/staking/client";
import { SOLANA_RPC_ENDPOINT, KOHAI_TOKEN_MINT } from "@/lib/staking/config";
import type { StakingStats } from "@/lib/staking/types";
import { useWallet } from "@/contexts/WalletContext";

export function useStaking() {
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { address, isConnected } = useWallet();
  const [stakingClient, setStakingClient] = useState<StakingClient | null>(
    null
  );
  const [stats, setStats] = useState<StakingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Anchor provider and staking client
  const connection = useMemo(
    () => new Connection(SOLANA_RPC_ENDPOINT, "confirmed"),
    []
  );

  useEffect(() => {
    if (!walletProvider || !address) {
      setStakingClient(null);
      return;
    }

    try {
      const provider = new AnchorProvider(
        connection,
        walletProvider as any,
        { commitment: "confirmed" }
      );
      const client = new StakingClient(provider);
      setStakingClient(client);
    } catch (err) {
      console.error("Error initializing staking client:", err);
      setError("Failed to initialize staking client");
    }
  }, [walletProvider, address, connection]);

  // Fetch staking statistics
  const fetchStats = useCallback(async () => {
    if (!stakingClient || !address) {
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userPublicKey = new PublicKey(address);
      const stakingStats = await stakingClient.getStakingStats(
        userPublicKey,
        KOHAI_TOKEN_MINT
      );
      setStats(stakingStats);
    } catch (err: any) {
      console.error("Error fetching staking stats:", err);
      setError(err.message || "Failed to fetch staking stats");
    } finally {
      setLoading(false);
    }
  }, [stakingClient, address]);

  // Auto-fetch stats when client is ready
  useEffect(() => {
    if (stakingClient && address) {
      fetchStats();
    }
  }, [stakingClient, address, fetchStats]);

  // Stake tokens
  const stake = useCallback(
    async (amount: number) => {
      if (!stakingClient) {
        throw new Error("Staking client not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        const signature = await stakingClient.stake(amount, KOHAI_TOKEN_MINT);
        console.log("Stake transaction signature:", signature);

        // Wait for confirmation
        await connection.confirmTransaction(signature, "confirmed");

        // Refresh stats
        await fetchStats();

        return signature;
      } catch (err: any) {
        console.error("Error staking:", err);
        const errorMessage = err.message || "Failed to stake tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [stakingClient, connection, fetchStats]
  );

  // Unstake tokens
  const unstake = useCallback(
    async (amount: number) => {
      if (!stakingClient) {
        throw new Error("Staking client not initialized");
      }

      setLoading(true);
      setError(null);

      try {
        const signature = await stakingClient.unstake(amount, KOHAI_TOKEN_MINT);
        console.log("Unstake transaction signature:", signature);

        // Wait for confirmation
        await connection.confirmTransaction(signature, "confirmed");

        // Refresh stats
        await fetchStats();

        return signature;
      } catch (err: any) {
        console.error("Error unstaking:", err);
        const errorMessage = err.message || "Failed to unstake tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [stakingClient, connection, fetchStats]
  );

  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!stakingClient) {
      throw new Error("Staking client not initialized");
    }

    setLoading(true);
    setError(null);

    try {
      const signature = await stakingClient.claimRewards(KOHAI_TOKEN_MINT);
      console.log("Claim rewards transaction signature:", signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, "confirmed");

      // Refresh stats
      await fetchStats();

      return signature;
    } catch (err: any) {
      console.error("Error claiming rewards:", err);
      const errorMessage = err.message || "Failed to claim rewards";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [stakingClient, connection, fetchStats]);

  return {
    stats,
    loading,
    error,
    isReady: !!stakingClient && isConnected,
    stake,
    unstake,
    claimRewards,
    refreshStats: fetchStats,
  };
}
