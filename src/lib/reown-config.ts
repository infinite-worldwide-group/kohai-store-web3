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
    onramp: true,     // ✅ Enable On-Ramp (buy crypto with fiat via Meld.io)
    swaps: true,      // ✅ Enable Swap (swap tokens directly in wallet)
  },
  enableWalletConnect: true,
  enableInjected: true,
  enableCoinbase: true,
  allWallets: 'SHOW',
  // Include popular Solana wallets for better QR code support
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f', // Safe
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4', // Binance Web3 Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a', // Uniswap
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6', // Blue accent color
    '--w3m-border-radius-master': '8px',
  },
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
