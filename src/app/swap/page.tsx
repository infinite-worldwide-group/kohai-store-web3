"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useRouter } from "next/navigation";
import StoreLayout from "@/components/Layouts/StoreLayout";
import Loader from "@/components/common/Loader";

// Token list for Solana
const SOLANA_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  },
  {
    symbol: 'USDT',
    name: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  },
];

export default function SwapPage() {
  const { isConnected, address, sendTransaction, getBalance } = useWallet();
  const router = useRouter();

  const [fromToken, setFromToken] = useState(SOLANA_TOKENS[0]); // SOL
  const [toToken, setToToken] = useState(SOLANA_TOKENS[1]); // USDT
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<string>('0');
  const [isFallbackPricing, setIsFallbackPricing] = useState(false);
  const [priceSource, setPriceSource] = useState<string>('Jupiter');

  // Fetch user balance
  useEffect(() => {
    if (isConnected && address) {
      getBalance().then((bal) => {
        setBalance(String(bal || '0'));
      });
    }
  }, [isConnected, address, getBalance]);

  // Get quote from Jupiter via API route
  const fetchQuote = async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount('');
      setQuote(null);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🔍 Fetching quote for:', inputAmount, fromToken.symbol);

      // Convert amount to smallest unit (lamports for SOL, etc.)
      const amountInSmallestUnit = Math.floor(
        parseFloat(inputAmount) * Math.pow(10, fromToken.decimals)
      );

      console.log('📊 Amount in smallest unit:', amountInSmallestUnit);

      // Call our API route instead of Jupiter directly (avoids CORS)
      const url = `/api/swap/quote?inputMint=${fromToken.mint}&outputMint=${toToken.mint}&amount=${amountInSmallestUnit}&slippageBps=50`;
      console.log('🌐 Calling API:', url);

      const response = await fetch(url);

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch quote');
      }

      const quoteData = await response.json();
      console.log('✅ Quote received:', quoteData);

      if (quoteData.error) {
        throw new Error(quoteData.error);
      }

      if (!quoteData.outAmount) {
        throw new Error('Invalid quote response: missing outAmount');
      }

      setQuote(quoteData);

      // Determine price source and whether swap is available
      if (quoteData._isOrca) {
        setPriceSource('Orca');
        setIsFallbackPricing(false);
        console.log('🐳 Using Orca DEX');
      } else if (quoteData._isCoinGecko) {
        setPriceSource('CoinGecko');
        setIsFallbackPricing(true);
        console.log('⚠️ Using CoinGecko pricing - swap unavailable');
      } else if (quoteData._isFallback) {
        setPriceSource('Estimated');
        setIsFallbackPricing(true);
        console.log('⚠️ Using estimated pricing - swap unavailable');
      } else {
        setPriceSource('Jupiter');
        setIsFallbackPricing(false);
        console.log('✅ Using Jupiter DEX');
      }

      // Calculate output amount
      const outputAmount = quoteData.outAmount / Math.pow(10, toToken.decimals);
      setToAmount(outputAmount.toFixed(6));
      console.log('💰 Output amount:', outputAmount, toToken.symbol);
    } catch (err: any) {
      console.error('❌ Quote error:', err);
      setError(err.message || 'Failed to get quote. Please try again.');
      setToAmount('');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && parseFloat(value) > 0) {
      fetchQuote(value);
    } else {
      setToAmount('');
      setQuote(null);
    }
  };

  // Swap tokens
  const handleSwap = async () => {
    if (!quote || !isConnected || !address) {
      setError('Please connect wallet and get a quote first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('🔄 Starting swap...');

      // Get swap transaction from our API route
      const swapResponse = await fetch('/api/swap/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: address,
        }),
      });

      if (!swapResponse.ok) {
        const errorData = await swapResponse.json();
        throw new Error(errorData.error || 'Failed to get swap transaction');
      }

      const data = await swapResponse.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const { swapTransaction } = data;

      console.log('📝 Transaction received, sending to wallet...');

      // For swap transactions, we need to send the pre-built transaction
      // This will be implemented when we have the full swap integration
      // For now, show an error message
      console.log('Swap transaction data:', swapTransaction);
      throw new Error('Swap transaction sending is not yet fully implemented. Please use a direct DEX.');
    } catch (err: any) {
      console.error('❌ Swap error:', err);
      setError(err.message || 'Swap failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Flip tokens
  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('');
    setQuote(null);
  };

  if (!isConnected) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Connect Wallet</h2>
            <p className="text-gray-400 mb-6">
              Please connect your wallet to use the swap feature.
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
            >
              Go to Home & Connect Wallet
            </button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Swap Tokens</h1>
          <p className="text-gray-400">
            Exchange tokens on Solana network with the best rates.
          </p>
        </div>

        {/* Wallet Balance */}
        <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Your Wallet</p>
              <p className="text-sm font-mono text-white truncate max-w-[300px]">
                {address}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Balance</p>
              <p className="text-lg font-bold text-white">{parseFloat(balance).toFixed(4)} SOL</p>
            </div>
          </div>
        </div>

        {/* Swap Interface */}
        <div className="rounded-lg bg-white/5 backdrop-blur-md border border-white/10 p-6 mb-6">
          {/* From Token */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">From</label>
            <div className="rounded-lg bg-black/30 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={fromToken.logoURI} alt={fromToken.symbol} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">{fromToken.symbol}</p>
                    <p className="text-xs text-gray-400">{fromToken.name}</p>
                  </div>
                </div>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold text-white outline-none"
                step="0.000001"
                min="0"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleFlipTokens}
              className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-3 hover:from-purple-600 hover:to-blue-600 transition"
            >
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">To</label>
            <div className="rounded-lg bg-black/30 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img src={toToken.logoURI} alt={toToken.symbol} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-white">{toToken.symbol}</p>
                    <p className="text-xs text-gray-400">{toToken.name}</p>
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-sm">Getting quote...</span>
                  </div>
                ) : (
                  toAmount || '0.00'
                )}
              </div>
            </div>
          </div>

          {/* Pricing Source Info */}
          {quote && priceSource === 'Orca' && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-blue-300 font-semibold">🐳 Powered by Orca</p>
                  <p className="text-xs text-blue-200/80 mt-1">
                    Using Orca DEX for this swap. Real-time pricing and swap available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Pricing Warning */}
          {isFallbackPricing && (
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 mb-4">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-300 font-semibold">⚠️ Estimated Pricing Only</p>
                  <p className="text-xs text-yellow-200/80 mt-1">
                    DEX APIs are unavailable. Using {priceSource} pricing for reference only.
                    Swap functionality is disabled until DEX connection is restored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quote Details */}
          {quote && !isFallbackPricing && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span className="text-white font-semibold">
                  1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Price Impact</span>
                <span className="text-white">{quote.priceImpactPct ? `${(quote.priceImpactPct * 100).toFixed(3)}%` : 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 mb-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={!quote || isLoading || !fromAmount || isFallbackPricing}
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 text-lg font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title={isFallbackPricing ? 'Swap unavailable - Jupiter API connection failed' : ''}
          >
            {isLoading ? 'Swapping...' : isFallbackPricing ? 'Swap Unavailable (Network Issue)' : 'Swap Tokens'}
          </button>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 p-6">
          <div className="flex items-start gap-3">
            <svg className="h-6 w-6 text-purple-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-2">How It Works</h3>
              <ul className="text-sm text-purple-200/80 space-y-2 list-disc list-inside">
                <li>Enter the amount you want to swap</li>
                <li>Review the quote and rate</li>
                <li>Click "Swap Tokens" and confirm in your wallet</li>
                <li>Transaction typically takes a few seconds</li>
              </ul>
              <p className="text-sm text-purple-200/80 mt-3">
                <strong>Powered by {priceSource}:</strong> {priceSource === 'Jupiter' || priceSource === 'Orca'
                  ? 'Best prices across Solana DEXs'
                  : 'Market pricing for reference only'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
