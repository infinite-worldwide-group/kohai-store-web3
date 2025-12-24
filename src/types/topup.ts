export type NetworkType = "solana" | "ethereum" | "bsc" | "avalanche" | "tron";

export type PaymentSessionStatus = "pending" | "processing" | "completed" | "failed" | "expired";

export interface Network {
  id: NetworkType;
  name: string;
  symbol: string;
  icon: string;
  chainId?: number;
  rpcUrl?: string;
  explorerUrl?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface LiFiQuoteMetadata {
  quoteId: string;
  estimatedOutput: number;      // Amount user receives after fees (in USDT)
  bridgeFees: number;            // LI.FI bridge fees (in USDT)
  gasCosts: number;              // Estimated gas costs (in USDT)
  totalCost: number;             // amount + bridgeFees + gasCosts
  route?: any;                   // LI.FI route details
}

export interface PaymentSession {
  sessionId: string;
  userId: number;
  walletAddress: string;
  amount: number;
  token: string;
  network: NetworkType;
  status: PaymentSessionStatus;
  depositAddress: string; // Where user sends funds
  createdAt: Date;
  expiresAt: Date;
  txHash?: string;
  completedAt?: Date;
  metadata?: {
    lifi?: LiFiQuoteMetadata;
    [key: string]: any;
  };
}

export interface CreatePaymentSessionRequest {
  amount: number;
  network: NetworkType;
  token?: string; // defaults to USDT
}

export interface CreatePaymentSessionResponse {
  success: boolean;
  session?: PaymentSession;
  paymentUrl?: string; // URL to payment page
  quote?: LiFiQuoteMetadata; // Bridge quote information
  errors?: string[];
}

export interface VerifyTransactionRequest {
  sessionId: string;
  txHash: string;
}

export interface VerifyTransactionResponse {
  success: boolean;
  verified: boolean;
  credited: boolean;
  amount?: number;
  errors?: string[];
}

export interface TopupNotification {
  type: "pending" | "processing" | "success" | "error";
  message: string;
  sessionId?: string;
  txHash?: string;
  amount?: number;
}
