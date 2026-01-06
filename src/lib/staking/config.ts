import { PublicKey } from "@solana/web3.js";

// Staking Program Configuration
export const STAKING_PROGRAM_ID = new PublicKey(
  "Bmtrb34ikPyAwdsobDBpiJWhRjh5adZWaRQ8kV9qDJ3d"
);

// KOHAI Token Mint Address (Update this with your actual KOHAI token mint)
// For devnet, you'll need to provide the correct mint address
export const KOHAI_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_KOHAI_TOKEN_MINT ||
    "KOHAI_MINT_ADDRESS_HERE" // Replace with actual KOHAI token mint
);

// RPC Configuration
// Staking always uses Devnet since the program is deployed on Devnet
export const SOLANA_RPC_ENDPOINT = "https://api.devnet.solana.com";

// Staking Pool Seeds
export const STAKING_POOL_SEED = "staking_pool";
export const USER_STAKE_SEED = "user_stake";
export const REWARD_VAULT_SEED = "reward_vault";
export const STAKE_VAULT_SEED = "stake_vault";
