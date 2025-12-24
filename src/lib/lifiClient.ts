import type { NetworkType } from '@/types/topup';

// LI.FI API Base URL
const LIFI_API_BASE_URL = 'https://li.quest/v1';

// Chain ID mapping for different networks
const CHAIN_IDS: Record<NetworkType, number> = {
  ethereum: 1,
  bsc: 56,
  avalanche: 43114,
  tron: 0, // Tron not supported by LI.FI, will need special handling
  solana: 1151111081099710, // Solana chain ID in LI.FI
};

// USDT token addresses on different chains
const USDT_ADDRESSES: Record<string, string> = {
  // Ethereum - USDT ERC20
  '1': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  // BSC - USDT BEP20
  '56': '0x55d398326f99059fF775485246999027B3197955',
  // Avalanche - USDT on C-Chain
  '43114': '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
  // Solana - USDT SPL Token
  '1151111081099710': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

export interface LiFiQuote {
  id: string;
  type: string;
  tool: string;
  toolDetails: {
    key: string;
    name: string;
    logoURI: string;
  };
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: {
      address: string;
      chainId: number;
      symbol: string;
      decimals: number;
      name: string;
      priceUSD: string;
    };
    toToken: {
      address: string;
      chainId: number;
      symbol: string;
      decimals: number;
      name: string;
      priceUSD: string;
    };
    fromAmount: string;
    toAmount: string;
    slippage: number;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    feeCosts: Array<{
      name: string;
      description: string;
      token: {
        address: string;
        symbol: string;
        decimals: number;
        priceUSD: string;
      };
      amount: string;
      amountUSD: string;
    }>;
    gasCosts: Array<{
      type: string;
      price: string;
      estimate: string;
      limit: string;
      amount: string;
      amountUSD: string;
      token: {
        address: string;
        symbol: string;
        decimals: number;
        priceUSD: string;
      };
    }>;
  };
  includedSteps: any[];
  transactionRequest?: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice: string;
  };
}

export interface SimplifiedQuote {
  quoteId: string;
  estimatedOutput: number;
  bridgeFees: number;
  gasCosts: number;
  totalCost: number;
  route?: any;
}

/**
 * Get chain ID for a given network
 */
export function getChainId(network: NetworkType): number {
  return CHAIN_IDS[network];
}

/**
 * Get USDT token address for a given chain ID
 */
export function getUSDTAddress(chainId: number): string | undefined {
  return USDT_ADDRESSES[chainId.toString()];
}

/**
 * Get Solana USDT address
 */
export function getSolanaUSDTAddress(): string {
  return USDT_ADDRESSES['1151111081099710'];
}

/**
 * Fetch bridge quote from LI.FI API
 *
 * @param fromNetwork - Source network (ethereum, bsc, avalanche, etc.)
 * @param amount - Amount in USDT
 * @param userAddress - Optional user address for more accurate quotes
 * @returns Simplified quote with fees and estimated output
 */
export async function getQuote(
  fromNetwork: NetworkType,
  amount: number,
  userAddress?: string
): Promise<SimplifiedQuote> {
  // Special handling for Solana (no bridge needed)
  if (fromNetwork === 'solana') {
    return {
      quoteId: 'no-bridge-needed',
      estimatedOutput: amount,
      bridgeFees: 0,
      gasCosts: 0,
      totalCost: amount,
    };
  }

  // Special handling for Tron (not supported yet)
  if (fromNetwork === 'tron') {
    throw new Error('Tron bridge not yet supported. Please use another network.');
  }

  const fromChainId = getChainId(fromNetwork);
  const toChainId = getChainId('solana');
  const fromTokenAddress = getUSDTAddress(fromChainId);
  const toTokenAddress = getSolanaUSDTAddress();

  if (!fromTokenAddress || !toTokenAddress) {
    throw new Error(`USDT token address not configured for ${fromNetwork}`);
  }

  // Convert amount to token units (USDT has 6 decimals)
  const fromAmount = (amount * 1_000_000).toString();

  // Use valid addresses (LiFi rejects zero addresses)
  // For quotes, we can use sample addresses if user address not provided
  const sampleEthAddress = '0x1111111111111111111111111111111111111111';
  const sampleSolAddress = '11111111111111111111111111111111';

  const fromAddr = userAddress || sampleEthAddress;
  const toAddr = userAddress || sampleSolAddress;

  try {
    const url = new URL(`${LIFI_API_BASE_URL}/quote`);
    url.searchParams.append('fromChain', fromChainId.toString());
    url.searchParams.append('toChain', toChainId.toString());
    url.searchParams.append('fromToken', fromTokenAddress);
    url.searchParams.append('toToken', toTokenAddress);
    url.searchParams.append('fromAmount', fromAmount);
    url.searchParams.append('fromAddress', fromAddr);
    url.searchParams.append('toAddress', toAddr);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LI.FI API error: ${response.status} ${response.statusText}`);
    }

    const quote: LiFiQuote = await response.json();

    // Extract fee information
    const bridgeFees = quote.estimate.feeCosts.reduce((total, fee) => {
      return total + parseFloat(fee.amountUSD || '0');
    }, 0);

    const gasCosts = quote.estimate.gasCosts.reduce((total, gas) => {
      return total + parseFloat(gas.amountUSD || '0');
    }, 0);

    // Convert toAmount from token units back to USDT
    const estimatedOutput = parseFloat(quote.estimate.toAmount) / 1_000_000;

    // Calculate total cost (amount + fees)
    const totalCost = amount + bridgeFees + gasCosts;

    return {
      quoteId: quote.id,
      estimatedOutput,
      bridgeFees,
      gasCosts,
      totalCost,
      route: {
        tool: quote.tool,
        toolDetails: quote.toolDetails,
        executionDuration: quote.estimate.executionDuration,
      },
    };
  } catch (error: any) {
    console.error('Error fetching LI.FI quote:', error);

    // Fallback estimate if API fails (use conservative 2% bridge fee + $1 gas)
    const fallbackBridgeFee = amount * 0.02;
    const fallbackGasCost = 1;

    return {
      quoteId: 'fallback-estimate',
      estimatedOutput: amount - fallbackBridgeFee - fallbackGasCost,
      bridgeFees: fallbackBridgeFee,
      gasCosts: fallbackGasCost,
      totalCost: amount + fallbackBridgeFee + fallbackGasCost,
    };
  }
}

/**
 * Get status of a bridge transaction from LI.FI
 *
 * @param txHash - Transaction hash from source chain
 * @param fromChainId - Source chain ID
 * @param toChainId - Destination chain ID
 * @returns Bridge status information
 */
export async function getBridgeStatus(
  txHash: string,
  fromChainId: number,
  toChainId: number
): Promise<any> {
  try {
    const url = `${LIFI_API_BASE_URL}/status`;
    const params = new URLSearchParams({
      txHash,
      bridge: 'lifi', // Or specific bridge from quote
      fromChain: fromChainId.toString(),
      toChain: toChainId.toString(),
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LI.FI status API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching bridge status:', error);
    throw error;
  }
}
