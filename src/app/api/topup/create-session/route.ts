import { NextRequest, NextResponse } from 'next/server';
import type { CreatePaymentSessionRequest, CreatePaymentSessionResponse, PaymentSession } from '@/types/topup';
import { saveSession, getAllSessions } from '@/lib/topupStorage';
import { getQuote } from '@/lib/lifiClient';

// Generate unique session ID
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `TOPUP-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentSessionRequest = await request.json();
    const { amount, network, token = 'USDT' } = body;

    // Get user info from JWT token
    // In production, verify JWT and get user data
    const authHeader = request.headers.get('authorization');
    const jwtToken = authHeader?.replace('Bearer ', '') || '';

    // Mock user data - in production, decode JWT and get actual user
    const userId = 123; // Replace with actual user ID from JWT
    const walletAddress = request.headers.get('x-wallet-address') || '';

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        errors: ['Wallet address is required'],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Get merchant wallet address based on selected network
    // Users send USDT to merchant's wallet on the selected network
    // Then receive SOL USDT in their Solana wallet
    const merchantWallets: Record<string, string | undefined> = {
      solana: process.env.NEXT_PUBLIC_MERCHANT_WALLET_SOL,
      ethereum: process.env.NEXT_PUBLIC_MERCHANT_WALLET_ETH,
      bsc: process.env.NEXT_PUBLIC_MERCHANT_WALLET_BNB,
      avalanche: process.env.NEXT_PUBLIC_MERCHANT_WALLET_AVAX,
      tron: process.env.NEXT_PUBLIC_MERCHANT_WALLET_TRON,
    };

    const depositAddress = merchantWallets[network];

    if (!depositAddress) {
      return NextResponse.json({
        success: false,
        errors: [`Merchant wallet not configured for ${network} network`],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid amount'],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Fetch LI.FI quote for bridge fees and estimated output
    console.log(`Fetching LI.FI quote for ${amount} ${token} on ${network}`);
    let quote;
    try {
      quote = await getQuote(network, amount, walletAddress);
      console.log(`Quote received:`, {
        quoteId: quote.quoteId,
        estimatedOutput: quote.estimatedOutput,
        bridgeFees: quote.bridgeFees,
        gasCosts: quote.gasCosts,
        totalCost: quote.totalCost,
      });
    } catch (quoteError: any) {
      console.error('Error fetching quote:', quoteError);
      return NextResponse.json({
        success: false,
        errors: [`Failed to get bridge quote: ${quoteError.message}`],
      } as CreatePaymentSessionResponse, { status: 500 });
    }

    // Create payment session
    const sessionId = generateSessionId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 60 minutes expiry (extended for bridge time)

    const session: PaymentSession = {
      sessionId,
      userId,
      walletAddress, // User's Solana wallet (for receiving SOL USDT)
      amount,
      token,
      network,
      status: 'pending',
      depositAddress, // Where user sends funds (Solana for SOL, EVM address for EVM chains)
      createdAt: now,
      expiresAt,
      metadata: {
        lifi: {
          quoteId: quote.quoteId,
          estimatedOutput: quote.estimatedOutput,
          bridgeFees: quote.bridgeFees,
          gasCosts: quote.gasCosts,
          totalCost: quote.totalCost,
          route: quote.route,
        },
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        addressType: network === 'solana' ? 'solana' : 'evm',
      },
    };

    // Store session (in production, save to database)
    saveSession(session);
    console.log(`✅ Created session: ${sessionId} with quote: ${quote.quoteId}`);

    // Generate payment URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const paymentUrl = `${baseUrl}/topups/pay/${sessionId}`;

    return NextResponse.json({
      success: true,
      session,
      paymentUrl,
      quote: {
        quoteId: quote.quoteId,
        estimatedOutput: quote.estimatedOutput,
        bridgeFees: quote.bridgeFees,
        gasCosts: quote.gasCosts,
        totalCost: quote.totalCost,
      },
    } as CreatePaymentSessionResponse);

  } catch (error: any) {
    console.error('Error creating payment session:', error);
    return NextResponse.json({
      success: false,
      errors: [error.message || 'Failed to create payment session'],
    } as CreatePaymentSessionResponse, { status: 500 });
  }
}

// GET endpoint to retrieve all sessions (for debugging)
export async function GET() {
  const allSessions = getAllSessions();
  return NextResponse.json({
    success: true,
    sessions: allSessions,
    count: allSessions.length,
  });
}
