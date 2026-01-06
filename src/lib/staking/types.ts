import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface StakingPool {
  authority: PublicKey;
  tokenMint: PublicKey;
  rewardVault: PublicKey;
  stakeVault: PublicKey;
  totalRewardAmount: BN;
  totalStaked: BN;
  totalRewardsDistributed: BN;
  startTime: BN;
  endTime: BN;
  lockPeriodSeconds: BN;
  bump: number;
}

export interface UserStake {
  owner: PublicKey;
  stakingPool: PublicKey;
  amount: BN;
  rewardDebt: BN;
  stakeTimestamp: BN;
  lastClaimTimestamp: BN;
  bump: number;
}

export interface StakingStats {
  totalStaked: number;
  userStaked: number;
  pendingRewards: number;
  apy: number;
  lockPeriod: number;
  canUnstake: boolean;
  timeUntilUnlock: number;
}
