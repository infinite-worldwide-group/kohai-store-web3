/**
 * Reown (WalletConnect) Configuration
 *
 * Set up your NEXT_PUBLIC_REOWN_PROJECT_ID in .env.local
 * Get your project ID from: https://cloud.reown.com/
 */

import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { createAppKit } from '@reown/appkit/react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Get project ID from environment variable
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || '';

if (!projectId) {
  console.warn(
    '⚠️ NEXT_PUBLIC_REOWN_PROJECT_ID is not set. Please add it to your .env.local file.\n' +
    'Get your project ID from: https://cloud.reown.com/'
  );
}

// Solana adapter configuration
export const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ]
});

// Metadata for your app
const metadata = {
  name: 'Kohai Store',
  description: 'Web3 Gaming Store - Buy game credits with crypto',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://store.kohai.gg',
  icons: [
    typeof window !== 'undefined'
      ? `${window.location.origin}/images/logo.png`
      : 'https://store.kohai.gg/images/logo.png'
  ]
};

// Create the Reown AppKit modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId,
  networks: [solana, solanaTestnet, solanaDevnet],
  metadata,
  features: {
    analytics: true,
    email: true,      // ✅ Enable email login
    socials: ['google', 'discord', 'github', 'apple'], // ✅ Enable social logins
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  allWallets: 'SHOW',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6', // Blue accent color
    '--w3m-border-radius-master': '8px',
  },
  // Disable auto-reconnect to prevent connecting to old wallet on refresh
  enableOnramp: false,
});

// Export network configurations
export const networks = {
  mainnet: solana,
  testnet: solanaTestnet,
  devnet: solanaDevnet,
};

// Default network (change to mainnet for production)
// Currently using MAINNET for production - change to solanaDevnet for testing
export const defaultNetwork = solana;
