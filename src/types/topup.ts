export type NetworkType = "solana" | "ethereum" | "bsc" | "avalanche" | "tron";

export type PaymentMethod = "crypto" | "meld"; // crypto = QR code, meld = fiat payment

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

export interface MeldPaymentMetadata {
  paymentId: string;             // Meld payment ID
  paymentUrl: string;            // Meld checkout URL
  currency: string;              // Fiat currency (USD, MYR, etc.)
  fiatAmount: number;            // Amount in fiat currency
  exchangeRate?: number;         // Fiat to crypto exchange rate
  paymentMethods?: string[];     // Available payment methods (FPX, card, etc.)
}

export interface PaymentSession {
  sessionId: string;
  userId: number;
  walletAddress: string;
  amount: number;
  token: string;
  network: NetworkType;
  paymentMethod: PaymentMethod; // How user pays (crypto QR or Meld fiat)
  status: PaymentSessionStatus;
  depositAddress: string; // Where user sends funds (crypto) or merchant wallet (meld)
  createdAt: Date;
  expiresAt: Date;
  txHash?: string;
  completedAt?: Date;
  metadata?: {
    lifi?: LiFiQuoteMetadata;
    meld?: MeldPaymentMetadata;
    [key: string]: any;
  };
}

export interface CreatePaymentSessionRequest {
  amount: number;
  network: NetworkType;
  token?: string; // defaults to USDT
  paymentMethod?: PaymentMethod; // defaults to crypto
  currency?: string; // for Meld fiat payments (USD, MYR, etc.)
}

export interface CreatePaymentSessionResponse {
  success: boolean;
  session?: PaymentSession;
  paymentUrl?: string; // URL to payment page (or Meld checkout URL)
  quote?: LiFiQuoteMetadata; // Bridge quote information (for crypto)
  meldPayment?: MeldPaymentMetadata; // Meld payment info (for fiat)
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
