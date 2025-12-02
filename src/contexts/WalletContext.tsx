"use client";

import { createContext, ReactNode, useContext, useEffect, useState, useRef } from "react";
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import type { Provider } from '@reown/appkit-adapter-solana/react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAuthenticateWalletMutation } from "graphql/generated/graphql";
import { modal } from '@/lib/reown-config';
import { clearApolloCache } from '@/lib/apollo-client';

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  address: string | undefined;
  isConnecting: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;

  // Solana specific
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (to: string, amount: number) => Promise<string | null>;
  getBalance: () => Promise<number | null>;

  // Reown modal
  openModal: () => void;
  closeModal: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const appKit = useAppKit();
  const { open, close } = appKit;
  const { address: appKitAddress, isConnected: appKitIsConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>('solana');

  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [authenticateWallet] = useAuthenticateWalletMutation();

  // Track previous address to detect wallet switches
  const previousAddressRef = useRef<string | undefined>(undefined);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Track the actual extension address (may differ from AppKit)
  const [extensionAddress, setExtensionAddress] = useState<string | undefined>(undefined);

  // Local state to immediately reflect disconnect
  const isConnected = !isDisconnecting && appKitIsConnected;

  // Use extension address if available and different from AppKit, otherwise use AppKit address
  const address = !isDisconnecting
    ? (extensionAddress || appKitAddress)
    : undefined;

  // RPC endpoint - use environment variable or default to devnet
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcEndpoint);

  const connect = () => {
    setIsConnecting(true);
    open();
  };

  const disconnect = async () => {
    try {
      // Immediately set disconnecting state to update UI
      setIsDisconnecting(true);

      // Clear extension address override
      setExtensionAddress(undefined);

      // Clear JWT token immediately
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('jwtToken');
      }

      // Use AppKit's official disconnect method for Solana namespace
      await modal.disconnect();

      // Close modal
      close();

      // Clear ALL AppKit/WalletConnect related storage after disconnect
      if (typeof window !== 'undefined') {
        // Small delay to ensure disconnect completes
        await new Promise(resolve => setTimeout(resolve, 100));

        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (
            key.startsWith('wc@2:') ||
            key.startsWith('@w3m/') ||
            key.startsWith('W3M_') ||
            key.startsWith('WALLETCONNECT_') ||
            key.includes('walletconnect') ||
            key.includes('reown')
          )) {
            keysToRemove.push(key);
          }
        }

        // Remove all identified keys
        keysToRemove.forEach(key => window.localStorage.removeItem(key));

        // Also clear sessionStorage
        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key && (
            key.startsWith('wc@2:') ||
            key.startsWith('@w3m/') ||
            key.startsWith('W3M_') ||
            key.includes('walletconnect') ||
            key.includes('reown')
          )) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach(key => window.sessionStorage.removeItem(key));

        console.log('Wallet disconnected and storage cleared');
      }

      // Reset disconnecting state
      setTimeout(() => {
        setIsDisconnecting(false);
      }, 300);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Reset disconnecting state on error
      setIsDisconnecting(false);
    }
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!walletProvider || !address) {
      console.error('Wallet not connected');
      return null;
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await walletProvider.signMessage(encodedMessage);
      return Buffer.from(signature).toString('base64');
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  };

  const sendTransaction = async (to: string, amount: number): Promise<string | null> => {
    if (!walletProvider || !address) {
      console.error('Wallet not connected');
      throw new Error('Wallet not connected');
    }

    try {
      const fromPubkey = new PublicKey(address);
      const toPubkey = new PublicKey(to);

      // Calculate lamports needed
      const lamportsToSend = Math.floor(amount * LAMPORTS_PER_SOL);
      const estimatedFee = 5000; // Approximately 0.000005 SOL for transaction fee

      // Check balance before attempting transaction
      const balance = await connection.getBalance(fromPubkey);
      console.log('Current balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      console.log('Amount to send:', lamportsToSend / LAMPORTS_PER_SOL, 'SOL');
      console.log('Estimated fee:', estimatedFee / LAMPORTS_PER_SOL, 'SOL');
      console.log('Total needed:', (lamportsToSend + estimatedFee) / LAMPORTS_PER_SOL, 'SOL');

      if (balance < lamportsToSend + estimatedFee) {
        const network = rpcEndpoint.includes('devnet') ? 'devnet' : rpcEndpoint.includes('testnet') ? 'testnet' : 'mainnet';
        throw new Error(
          `Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL but need ${((lamportsToSend + estimatedFee) / LAMPORTS_PER_SOL).toFixed(6)} SOL (including fees). ` +
          `You are on ${network}. Get ${network} SOL from a faucet: https://faucet.solana.com`
        );
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: lamportsToSend,
        })
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      console.log('Sending transaction...');
      console.log('Transaction details:', {
        from: fromPubkey.toString(),
        to: toPubkey.toString(),
        amount: lamportsToSend,
        blockhash,
      });

      // Debug: Check what methods are available on walletProvider
      console.log('Available wallet provider methods:', Object.keys(walletProvider));
      console.log('signTransaction available?', typeof walletProvider.signTransaction);
      console.log('sendTransaction available?', typeof walletProvider.sendTransaction);
      console.log('signAndSendTransaction available?', typeof (walletProvider as any).signAndSendTransaction);

      let signature: string;

      // Try approach 1: Use sendTransaction (standard Solana wallet adapter method)
      if (typeof walletProvider.sendTransaction === 'function') {
        try {
          console.log('Attempting sendTransaction (standard wallet adapter method)...');
          signature = await walletProvider.sendTransaction(transaction, connection, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
          console.log('Transaction sent via sendTransaction successfully');
        } catch (sendError: any) {
          console.error('Error with sendTransaction approach:', sendError);
          console.error('Send error details:', {
            message: sendError.message,
            code: sendError.code,
            name: sendError.name,
          });

          // Fallback: Try signTransaction + sendRawTransaction
          try {
            console.log('Trying fallback: signTransaction + sendRawTransaction');
            const signedTransaction = await walletProvider.signTransaction(transaction);
            console.log('Transaction signed successfully');

            const rawTransaction = signedTransaction.serialize();
            console.log('Transaction serialized, sending...');

            signature = await connection.sendRawTransaction(rawTransaction, {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
            });
            console.log('Raw transaction sent successfully');
          } catch (signError: any) {
            console.error('Error with signTransaction fallback:', signError);
            throw new Error(`All transaction methods failed. Last error: ${signError.message || 'Unknown error'}`);
          }
        }
      } else {
        // No sendTransaction method, try sign + send approach
        try {
          console.log('Attempting to sign transaction...');
          const signedTransaction = await walletProvider.signTransaction(transaction);
          console.log('Transaction signed successfully');

          const rawTransaction = signedTransaction.serialize();
          console.log('Transaction serialized, sending...');

          signature = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
          console.log('Raw transaction sent successfully');
        } catch (signError: any) {
          console.error('Error with signTransaction approach:', signError);
          throw new Error(`Failed to send transaction: ${signError.message || 'Unknown error'}`);
        }
      }

      console.log('Transaction sent:', signature);

      // Wait for confirmation using new API
      console.log('Waiting for confirmation...');
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      console.log('Transaction confirmed!');
      return signature;
    } catch (error: any) {
      console.error('Error sending transaction:', error);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

      // Provide more helpful error messages
      if (error.message?.includes('Insufficient balance')) {
        throw error; // Re-throw our custom balance error
      } else if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        throw new Error('Transaction rejected by user');
      } else if (error.message?.includes('simulate') || error.message?.includes('simulation')) {
        throw new Error(
          'Transaction simulation failed. This usually means: ' +
          '1) Insufficient balance for transaction + fees, ' +
          '2) Network mismatch (wallet on different network), or ' +
          '3) Invalid transaction parameters. ' +
          'Check console for details: ' + (error.message || '')
        );
      } else if (error.message?.includes('blockhash not found') || error.message?.includes('Blockhash not found')) {
        throw new Error('Transaction expired. Please try again.');
      } else if (error.message?.includes('not connected') || !walletProvider) {
        throw new Error('Wallet not connected. Please connect your wallet and try again.');
      }

      // Include the actual error message in the thrown error
      const errorMsg = error.message || error.toString() || 'Unknown error occurred';
      throw new Error(`Transaction failed: ${errorMsg}. Check console for more details.`);
    }
  };

  const getBalance = async (): Promise<number | null> => {
    if (!address) return null;

    try {
      const pubkey = new PublicKey(address);
      const balance = await connection.getBalance(pubkey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      return null;
    }
  };

  const openModal = () => open();
  const closeModal = () => close();

  // Listen for clear-apollo-cache event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClearCache = () => {
      console.log('🗑️ Clear cache event received - resetting Apollo cache');
      clearApolloCache();
    };

    window.addEventListener('clear-apollo-cache', handleClearCache);
    return () => window.removeEventListener('clear-apollo-cache', handleClearCache);
  }, []);

  // Listen for Phantom/Solflare wallet extension account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected) return;

    const handleAccountChange = (publicKey: any) => {
      console.log('🔄 Wallet extension account changed event detected');
      console.log('Event payload:', publicKey);
      console.log('Type of payload:', typeof publicKey);

      // Handle different event payload formats
      let newAddress: string | undefined;

      if (publicKey === null || publicKey === undefined) {
        console.log('Account disconnected or null payload received');
        return; // Ignore disconnect events
      } else if (typeof publicKey === 'string') {
        newAddress = publicKey;
      } else if (publicKey?.toString && typeof publicKey.toString === 'function') {
        newAddress = publicKey.toString();
      } else if (publicKey?.toBase58 && typeof publicKey.toBase58 === 'function') {
        newAddress = publicKey.toBase58();
      }

      console.log('Parsed new address from extension:', newAddress);
      console.log('Current AppKit address:', appKitAddress);
      console.log('Current extension address override:', extensionAddress);
      console.log('Current effective address:', address);

      if (newAddress) {
        const currentEffectiveAddress = extensionAddress || appKitAddress;

        if (newAddress !== currentEffectiveAddress) {
          console.log('⚠️ Address change detected!');
          console.log('Previous:', currentEffectiveAddress);
          console.log('New:', newAddress);

          // Update extension address immediately so UI shows new address
          setExtensionAddress(newAddress);

          // Clear old JWT token
          window.localStorage.removeItem('jwtToken');
          console.log('Cleared old JWT token for extension wallet switch');

          // Force re-render to trigger re-authentication
          setForceUpdate(prev => prev + 1);

          // Delay the wallet-switched event to allow authentication to start
          setTimeout(() => {
            // Also dispatch a clear-cache event to force Apollo to refetch
            window.dispatchEvent(new CustomEvent('clear-apollo-cache'));

            window.dispatchEvent(new CustomEvent('wallet-switched', {
              detail: {
                previousAddress: currentEffectiveAddress,
                newAddress: newAddress
              }
            }));
            console.log('✅ Dispatched wallet-switched event');
          }, 300); // Reduced - components will poll for auth completion

          console.log('✅ Extension address updated in UI');
        } else {
          console.log('ℹ️ Same address, no change needed');
        }
      }
    };

    // Listen to Phantom wallet (try multiple event names)
    const phantom = (window as any).phantom?.solana;
    if (phantom) {
      try {
        console.log('✅ Phantom wallet detected');
        console.log('Phantom current publicKey:', phantom.publicKey?.toString());
        console.log('Phantom isConnected:', phantom.isConnected);

        if (typeof phantom.on === 'function') {
          // Try 'accountChanged' (standard)
          phantom.on('accountChanged', handleAccountChange);
          console.log('✅ Phantom accountChanged listener added');

          // Also try 'accountsChanged' (alternative)
          phantom.on('accountsChanged', handleAccountChange);
          console.log('✅ Phantom accountsChanged listener added');
        } else {
          console.log('⚠️ Phantom does not support .on() method, will rely on polling');
        }
      } catch (error) {
        console.log('⚠️ Could not add Phantom listener (will use polling):', error);
      }
    } else {
      console.log('ℹ️ Phantom wallet not detected in window');
    }

    // Listen to Solflare wallet
    const solflare = (window as any).solflare;
    if (solflare) {
      try {
        console.log('✅ Solflare wallet detected - adding account change listener');
        if (typeof solflare.on === 'function') {
          solflare.on('accountChanged', handleAccountChange);
          console.log('Solflare accountChanged listener added successfully');
        }
      } catch (error) {
        console.log('Could not add Solflare listener (this is OK, will use polling)');
      }
    }

    // Also listen to walletProvider changes if available
    if (walletProvider) {
      console.log('✅ Wallet provider detected - checking for event listeners');

      // Some wallet providers expose an 'on' method for events
      try {
        if (typeof (walletProvider as any).on === 'function') {
          (walletProvider as any).on('accountChanged', handleAccountChange);
          console.log('Added accountChanged listener to walletProvider');
        }
      } catch (error) {
        // Some wallet providers may not properly support the 'on' method
        console.log('WalletProvider does not support accountChanged event listener (this is OK)');
      }
    }

    // Cleanup listeners
    return () => {
      try {
        if (phantom && typeof phantom.removeListener === 'function') {
          phantom.removeListener('accountChanged', handleAccountChange);
          phantom.removeListener('accountsChanged', handleAccountChange);
          console.log('Removed Phantom listeners');
        }
      } catch (e) {
        // Ignore cleanup errors
      }

      try {
        if (solflare && typeof solflare.removeListener === 'function') {
          solflare.removeListener('accountChanged', handleAccountChange);
          solflare.removeListener('accountsChanged', handleAccountChange);
          console.log('Removed Solflare listeners');
        }
      } catch (e) {
        // Ignore cleanup errors
      }

      try {
        if (walletProvider && typeof (walletProvider as any).removeListener === 'function') {
          (walletProvider as any).removeListener('accountChanged', handleAccountChange);
          console.log('Removed walletProvider listener');
        }
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [appKitAddress, isConnected, walletProvider]);

  // Periodically check if wallet extension address matches current effective address
  useEffect(() => {
    if (typeof window === 'undefined' || !isConnected) return;

    let checkCount = 0;
    const checkAddressSync = () => {
      checkCount++;
      const currentEffectiveAddress = extensionAddress || appKitAddress;

      // Log every 10th check (every 10 seconds) to avoid spam
      if (checkCount % 10 === 1) {
        console.log('🔍 Polling check #' + checkCount + ' - Current address:', currentEffectiveAddress);
      }

      if (!currentEffectiveAddress) {
        console.log('⚠️ No current address available for sync check');
        return;
      }

      // Check Phantom
      const phantom = (window as any).phantom?.solana;
      if (phantom?.isConnected && phantom.publicKey) {
        const phantomAddress = phantom.publicKey.toString();

        // Log detailed info on every check for debugging
        if (checkCount <= 5 || phantomAddress !== currentEffectiveAddress) {
          console.log('Phantom check:', {
            phantomAddress,
            currentEffectiveAddress,
            match: phantomAddress === currentEffectiveAddress
          });
        }

        if (phantomAddress !== currentEffectiveAddress) {
          console.log('⚠️ MISMATCH DETECTED! Phantom extension out of sync');
          console.log('Phantom has:', phantomAddress);
          console.log('UI showing:', currentEffectiveAddress);
          console.log('Updating UI to match Phantom...');

          // Update extension address
          setExtensionAddress(phantomAddress);

          // Clear JWT first
          window.localStorage.removeItem('jwtToken');
          console.log('Cleared old JWT token');

          // Force update to trigger re-authentication
          setForceUpdate(prev => prev + 1);

          // Delay the wallet-switched event to allow authentication to start
          setTimeout(() => {
            // Also dispatch a clear-cache event to force Apollo to refetch
            window.dispatchEvent(new CustomEvent('clear-apollo-cache'));

            window.dispatchEvent(new CustomEvent('wallet-switched', {
              detail: {
                previousAddress: currentEffectiveAddress,
                newAddress: phantomAddress
              }
            }));
            console.log('✅ Dispatched wallet-switched event');
          }, 300); // Reduced - components will poll for auth completion

          console.log('✅ Synced to Phantom address:', phantomAddress);
        } else if (extensionAddress && phantomAddress === appKitAddress) {
          // Extension and AppKit are back in sync, clear extensionAddress override
          console.log('✅ Phantom and AppKit are in sync, clearing override');
          setExtensionAddress(undefined);
        }
      } else {
        if (checkCount <= 3) {
          console.log('ℹ️ Phantom not connected or no publicKey');
        }
      }

      // Check Solflare
      const solflare = (window as any).solflare;
      if (solflare?.isConnected && solflare.publicKey) {
        const solflareAddress = solflare.publicKey.toString();
        if (solflareAddress !== currentEffectiveAddress) {
          console.log('⚠️ Solflare extension out of sync - updating');
          console.log('Solflare:', solflareAddress);
          console.log('Current:', currentEffectiveAddress);

          // Update extension address
          setExtensionAddress(solflareAddress);

          // Clear JWT first
          window.localStorage.removeItem('jwtToken');
          console.log('Cleared old JWT token');

          // Force update to trigger re-authentication
          setForceUpdate(prev => prev + 1);

          // Delay the wallet-switched event to allow authentication to start
          setTimeout(() => {
            // Also dispatch a clear-cache event to force Apollo to refetch
            window.dispatchEvent(new CustomEvent('clear-apollo-cache'));

            window.dispatchEvent(new CustomEvent('wallet-switched', {
              detail: {
                previousAddress: currentEffectiveAddress,
                newAddress: solflareAddress
              }
            }));
            console.log('✅ Dispatched wallet-switched event');
          }, 300); // Reduced - components will poll for auth completion

          console.log('✅ Synced to Solflare address');
        } else if (extensionAddress && solflareAddress === appKitAddress) {
          // Extension and AppKit are back in sync, clear extensionAddress override
          console.log('✅ Solflare and AppKit are in sync, using AppKit address');
          setExtensionAddress(undefined);
        }
      }
    };

    // Check immediately
    console.log('🚀 Starting wallet address sync polling');
    checkAddressSync();

    // Then check every 1 second (faster polling for better responsiveness)
    const syncInterval = setInterval(checkAddressSync, 1000);

    return () => {
      console.log('🛑 Stopping wallet address sync polling');
      clearInterval(syncInterval);
    };
  }, [isConnected, appKitAddress, extensionAddress]);

  // Detect wallet address changes (user switching wallets via modal)
  useEffect(() => {
    const previousAddress = previousAddressRef.current;
    const currentAddress = appKitAddress;

    // If address changed (and it's not just initial mount)
    if (previousAddress !== undefined && previousAddress !== currentAddress) {
      console.log('🔄 Wallet address changed!');
      console.log('Previous address:', previousAddress);
      console.log('New address:', currentAddress);

      // Clear old JWT token when switching wallets
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('jwtToken');
        console.log('Cleared old JWT token for wallet switch');

        // Wait for authentication to start
        setTimeout(() => {
          // Clear Apollo cache
          window.dispatchEvent(new CustomEvent('clear-apollo-cache'));

          // Dispatch custom event to notify all components
          window.dispatchEvent(new CustomEvent('wallet-switched', {
            detail: {
              previousAddress,
              newAddress: currentAddress
            }
          }));
          console.log('✅ Dispatched wallet-switched event for modal switch');
        }, 300); // Reduced - components will poll for auth completion
      }

      // Force re-render to update all components with new address
      setForceUpdate(prev => prev + 1);
    }

    // Update previous address ref
    previousAddressRef.current = currentAddress;
  }, [appKitAddress]);

  // Update connecting state when modal is closed
  useEffect(() => {
    if (appKitIsConnected) {
      setIsConnecting(false);
    }
  }, [appKitIsConnected]);

  // Reset disconnecting state when AppKit confirms disconnect
  useEffect(() => {
    if (!appKitIsConnected && isDisconnecting) {
      setIsDisconnecting(false);
    }
  }, [appKitIsConnected, isDisconnecting]);

  // Authenticate wallet with backend when connected or when wallet changes
  useEffect(() => {
    const authenticateWithBackend = async () => {
      // Use the effective address (extension override or AppKit)
      const effectiveAddress = extensionAddress || appKitAddress;

      if (!appKitIsConnected || !effectiveAddress) {
        // Clear JWT token when wallet disconnects
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('jwtToken');
        }
        return;
      }

      try {
        console.log('🔐 Authenticating wallet:', effectiveAddress);
        if (extensionAddress) {
          console.log('Using extension address (overriding AppKit)');
        }

        const result = await authenticateWallet({
          variables: {
            walletAddress: effectiveAddress,
            // Simple mode: Just wallet address (no signature verification)
            // For secure mode, you can sign a message and include signature + message
          },
        });

        if (result.data?.authenticateWallet?.token) {
          const token = result.data.authenticateWallet.token;

          // Store JWT token in localStorage
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('jwtToken', token);
            console.log('✅ Wallet authenticated successfully, JWT token stored');
            console.log('Current wallet address:', effectiveAddress);
          }
        } else if (result.data?.authenticateWallet?.errors && result.data.authenticateWallet.errors.length > 0) {
          console.error('❌ Authentication failed:', result.data.authenticateWallet.errors);
        }
      } catch (error) {
        console.error('❌ Error authenticating wallet:', error);
      }
    };

    authenticateWithBackend();
  }, [appKitIsConnected, appKitAddress, extensionAddress, authenticateWallet, forceUpdate]);

  const value: WalletContextType = {
    isConnected,
    address,
    isConnecting,
    connect,
    disconnect,
    signMessage,
    sendTransaction,
    getBalance,
    openModal,
    closeModal,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
