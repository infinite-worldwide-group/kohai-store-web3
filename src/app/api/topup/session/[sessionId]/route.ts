import { NextRequest, NextResponse } from 'next/server';
import type { PaymentSession } from '@/types/topup';
import { getSession, updateSession } from '@/lib/topupStorage';

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { sessionId } = await context.params;
    console.log(`📖 Looking up session: ${sessionId}`);

    // Retrieve session from storage
    const session = getSession(sessionId);

    if (!session) {
      console.log(`❌ Session not found: ${sessionId}`);
      return NextResponse.json({
        success: false,
        error: 'Payment session not found',
      }, { status: 404 });
    }

    console.log(`✅ Session found: ${sessionId}, status: ${session.status}`);

    // Check if session expired
    const now = new Date();
    if (now > session.expiresAt && session.status !== 'completed') {
      console.log(`⏰ Session expired: ${sessionId}`);
      updateSession(sessionId, { status: 'expired' });
      session.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      session,
    });

  } catch (error: any) {
    console.error('Error retrieving payment session:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to retrieve payment session',
    }, { status: 500 });
  }
}
