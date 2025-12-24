import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/topupStorage';
import { verifyMeldWebhook, type MeldWebhookPayload } from '@/lib/meldClient';

/**
 * Meld.io Webhook Handler
 *
 * Receives payment status updates from Meld.io
 * Auto-credits user balance when payment is completed
 */

// Credit user balance after successful payment
async function creditUserBalance(sessionId: string, amount: number, txHash: string): Promise<boolean> {
  try {
    // TODO: Implement actual balance crediting
    // 1. Update user's USDT balance in database
    // 2. Log transaction in transaction history
    // 3. Trigger webhook/notification to user

    console.log(`💰 Crediting ${amount} USDT to session ${sessionId}`);
    console.log(`📝 Transaction hash: ${txHash}`);

    // Mock successful credit
    return true;
  } catch (error) {
    console.error('Error crediting balance:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook payload
    const rawBody = await request.text();
    const payload: MeldWebhookPayload = JSON.parse(rawBody);

    // Verify webhook signature
    const signature = request.headers.get('x-meld-signature') || '';

    if (!verifyMeldWebhook(rawBody, signature)) {
      console.error('❌ Invalid Meld webhook signature');
      return NextResponse.json({
        success: false,
        error: 'Invalid signature',
      }, { status: 401 });
    }

    console.log(`📬 Received Meld webhook: ${payload.event} for payment ${payload.paymentId}`);

    // Get session by order ID
    const session = getSession(payload.orderId);

    if (!session) {
      console.error(`❌ Session not found: ${payload.orderId}`);
      return NextResponse.json({
        success: false,
        error: 'Session not found',
      }, { status: 404 });
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.pending':
        console.log(`⏳ Payment ${payload.paymentId} is pending`);
        updateSession(payload.orderId, {
          status: 'pending',
        });
        break;

      case 'payment.processing':
        console.log(`⚙️ Payment ${payload.paymentId} is processing`);
        updateSession(payload.orderId, {
          status: 'processing',
        });
        break;

      case 'payment.completed':
        console.log(`✅ Payment ${payload.paymentId} completed!`);
        console.log(`   Amount: ${payload.amount} ${payload.currency}`);
        console.log(`   Crypto: ${payload.cryptoAmount} ${payload.cryptoCurrency}`);
        console.log(`   TX Hash: ${payload.txHash}`);

        // Credit user balance
        const credited = await creditUserBalance(
          payload.orderId,
          payload.cryptoAmount, // Use crypto amount (SOL USDT)
          payload.txHash || ''
        );

        if (credited) {
          updateSession(payload.orderId, {
            status: 'completed',
            txHash: payload.txHash,
            completedAt: new Date(),
          });

          // TODO: Send notification to user
          console.log(`📧 TODO: Send notification to user for session ${payload.orderId}`);
        } else {
          updateSession(payload.orderId, {
            status: 'failed',
          });
        }
        break;

      case 'payment.failed':
        console.error(`❌ Payment ${payload.paymentId} failed`);
        updateSession(payload.orderId, {
          status: 'failed',
        });
        break;

      default:
        console.warn(`⚠️ Unknown webhook event: ${payload.event}`);
    }

    // Acknowledge webhook receipt
    return NextResponse.json({
      success: true,
      received: true,
    });

  } catch (error: any) {
    console.error('Error processing Meld webhook:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process webhook',
    }, { status: 500 });
  }
}

// GET endpoint to check webhook status (for debugging)
export async function GET() {
  return NextResponse.json({
    message: 'Meld webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
