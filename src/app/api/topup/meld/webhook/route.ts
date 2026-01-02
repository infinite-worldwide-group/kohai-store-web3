import { NextRequest, NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/topupStorage';
import { verifyMeldWebhook, type MeldWebhookPayload } from '@/lib/meldClient';
import { createOrderServerSide } from '@/lib/serverGraphQL';

/**
 * Meld.io Webhook Handler
 *
 * Receives payment status updates from Meld.io
 * Auto-credits user balance when payment is completed
 */

/**
 * Create order for user after successful Meld payment
 * This automatically purchases the game credit for the user
 */
async function createOrderForPayment(
  sessionId: string,
  session: any,
  amount: number,
  txHash: string
): Promise<{ success: boolean; order?: any; errors?: string[] }> {
  try {
    console.log(`🛒 Creating order for session ${sessionId}`);
    console.log(`📝 Transaction hash: ${txHash}`);
    console.log(`💰 Amount: ${amount} USDT`);

    // Check if product information is available
    if (!session.topupProductItemId) {
      console.warn(`⚠️ No product ID in session ${sessionId} - skipping order creation`);
      return {
        success: false,
        errors: ['No product ID specified - payment received but order not created'],
      };
    }

    // Create order via GraphQL
    const orderResult = await createOrderServerSide({
      topupProductItemId: session.topupProductItemId,
      transactionSignature: txHash,
      userData: session.userData,
      cryptoCurrency: 'USDT',
      cryptoAmount: amount,
      // Note: jwtToken would be needed for authentication
      // In production, you'd need to get the user's JWT token
      // For now, the backend should create order based on wallet address in tx
    });

    if (orderResult.success && orderResult.order) {
      console.log(`✅ Order created successfully: ${orderResult.order.orderNumber}`);
      console.log(`   Order ID: ${orderResult.order.id}`);
      console.log(`   Status: ${orderResult.order.status}`);
      return orderResult;
    } else {
      console.error(`❌ Failed to create order:`, orderResult.errors);
      return orderResult;
    }
  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      success: false,
      errors: [error.message || 'Failed to create order'],
    };
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

        // Create order for user (auto-purchase game credit)
        const orderResult = await createOrderForPayment(
          payload.orderId,
          session,
          payload.cryptoAmount, // Use crypto amount (SOL USDT)
          payload.txHash || ''
        );

        if (orderResult.success && orderResult.order) {
          // Order created successfully
          updateSession(payload.orderId, {
            status: 'completed',
            txHash: payload.txHash,
            completedAt: new Date(),
            metadata: {
              ...session.metadata,
              order: {
                orderId: orderResult.order.id,
                orderNumber: orderResult.order.orderNumber,
                status: orderResult.order.status,
              },
            },
          });

          console.log(`🎉 Payment processed and order created successfully!`);
          console.log(`   Order Number: ${orderResult.order.orderNumber}`);
          // TODO: Send notification to user with order details
        } else {
          // Payment received but order creation failed
          // Still mark payment as completed but flag the issue
          updateSession(payload.orderId, {
            status: 'completed',
            txHash: payload.txHash,
            completedAt: new Date(),
            metadata: {
              ...session.metadata,
              orderCreationFailed: true,
              orderErrors: orderResult.errors,
            },
          });

          console.error(`⚠️ Payment received but order creation failed`);
          console.error(`   Errors:`, orderResult.errors);
          // TODO: Alert admin about failed order creation
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
