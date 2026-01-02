import { NextRequest, NextResponse } from 'next/server';
import type { CreatePaymentSessionRequest, CreatePaymentSessionResponse, PaymentSession } from '@/types/topup';
import { saveSession, getAllSessions } from '@/lib/topupStorage';
import { getQuote } from '@/lib/lifiClient';
import { createMeldPayment } from '@/lib/meldClient';

// Generate unique session ID
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `TOPUP-${timestamp}-${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentSessionRequest = await request.json();
    const {
      amount,
      network,
      token = 'USDT',
      paymentMethod = 'crypto',
      currency = 'USD',
      topupProductItemId,
      userData,
    } = body;

    // Get user info from JWT token
    // In production, verify JWT and get user data
    // const authHeader = request.headers.get('authorization');
    // const jwtToken = authHeader?.replace('Bearer ', '') || '';

    // Mock user data - in production, decode JWT and get actual user
    const userId = 123; // Replace with actual user ID from JWT
    const walletAddress = request.headers.get('x-wallet-address') || '';

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        errors: ['Wallet address is required'],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Use user's wallet address as deposit address
    // Users top up directly to their own wallet
    const depositAddress = walletAddress;

    if (!depositAddress) {
      return NextResponse.json({
        success: false,
        errors: ['User wallet address is required'],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid amount'],
      } as CreatePaymentSessionResponse, { status: 400 });
    }

    // Handle based on payment method
    if (paymentMethod === 'meld') {
      // === MELD FIAT PAYMENT FLOW ===
      console.log(`Creating Meld fiat payment for ${amount} ${currency}`);

      // Create payment session ID first
      const sessionId = generateSessionId();
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';

      try {
        console.log('Creating Meld payment with params:', {
          amount,
          currency,
          cryptoCurrency: 'USDT',
          destinationAddress: walletAddress,
          orderId: sessionId,
        });

        const meldPayment = await createMeldPayment({
          amount,
          currency,
          cryptoCurrency: 'USDT', // USDT on Solana network
          destinationAddress: walletAddress, // User's wallet address
          orderId: sessionId,
          returnUrl: `${baseUrl}/topups/pay/${sessionId}?payment=meld`,
          webhookUrl: `${baseUrl}/api/topup/meld/webhook`,
        });

        console.log('Meld payment response:', meldPayment);

        if (!meldPayment.success) {
          console.error('Meld payment creation failed:', meldPayment.errors);
          return NextResponse.json({
            success: false,
            errors: meldPayment.errors || ['Failed to create Meld payment'],
          } as CreatePaymentSessionResponse, { status: 500 });
        }

        // Create session with Meld metadata
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

        const session: PaymentSession = {
          sessionId,
          userId,
          walletAddress,
          amount,
          token,
          network: 'solana', // Meld always delivers to Solana
          paymentMethod: 'meld',
          status: 'pending',
          depositAddress: walletAddress, // User's wallet address
          createdAt: now,
          expiresAt,
          topupProductItemId, // Store product ID for auto-order creation
          userData, // Store user data for order
          metadata: {
            meld: {
              paymentId: meldPayment.paymentId,
              paymentUrl: meldPayment.paymentUrl,
              currency,
              fiatAmount: amount,
            },
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            userAgent: request.headers.get('user-agent'),
          },
        };

        saveSession(session);
        console.log(`✅ Created Meld payment session: ${sessionId} with payment ID: ${meldPayment.paymentId}`);

        return NextResponse.json({
          success: true,
          session,
          paymentUrl: meldPayment.paymentUrl, // Redirect to Meld checkout
          meldPayment: {
            paymentId: meldPayment.paymentId,
            paymentUrl: meldPayment.paymentUrl,
            currency,
            fiatAmount: amount,
          },
        } as CreatePaymentSessionResponse);

      } catch (meldError: any) {
        console.error('Error creating Meld payment:', meldError);
        return NextResponse.json({
          success: false,
          errors: [meldError.message || 'Failed to create Meld payment'],
        } as CreatePaymentSessionResponse, { status: 500 });
      }
    }

    // === CRYPTO PAYMENT FLOW (existing) ===
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
      walletAddress, // User's wallet address (for receiving funds)
      amount,
      token,
      network,
      paymentMethod: 'crypto',
      status: 'pending',
      depositAddress, // User's own wallet address
      createdAt: now,
      expiresAt,
      topupProductItemId, // Store product ID for auto-order creation
      userData, // Store user data for order
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
