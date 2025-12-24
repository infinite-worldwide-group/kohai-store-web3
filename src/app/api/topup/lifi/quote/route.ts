import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/lifiClient';
import type { NetworkType } from '@/types/topup';

export interface QuoteRequest {
  amount: number;
  network: NetworkType;
  token?: string; // defaults to USDT
}

export interface QuoteResponse {
  success: boolean;
  quote?: {
    estimatedOutput: number;
    bridgeFees: number;
    gasCosts: number;
    totalCost: number;
    quoteId: string;
    route?: any;
  };
  errors?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();
    const { amount, network, token = 'USDT' } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        errors: ['Invalid amount'],
      } as QuoteResponse, { status: 400 });
    }

    if (!network) {
      return NextResponse.json({
        success: false,
        errors: ['Network is required'],
      } as QuoteResponse, { status: 400 });
    }

    // Currently only USDT is supported
    if (token !== 'USDT') {
      return NextResponse.json({
        success: false,
        errors: ['Only USDT is currently supported'],
      } as QuoteResponse, { status: 400 });
    }

    console.log(`Fetching LI.FI quote for ${amount} ${token} on ${network}`);

    // Get quote from LI.FI
    const quote = await getQuote(network, amount);

    console.log(`Quote received:`, {
      quoteId: quote.quoteId,
      estimatedOutput: quote.estimatedOutput,
      bridgeFees: quote.bridgeFees,
      gasCosts: quote.gasCosts,
      totalCost: quote.totalCost,
    });

    return NextResponse.json({
      success: true,
      quote: {
        quoteId: quote.quoteId,
        estimatedOutput: quote.estimatedOutput,
        bridgeFees: quote.bridgeFees,
        gasCosts: quote.gasCosts,
        totalCost: quote.totalCost,
        route: quote.route,
      },
    } as QuoteResponse);

  } catch (error: any) {
    console.error('Error in quote endpoint:', error);
    return NextResponse.json({
      success: false,
      errors: [error.message || 'Failed to get bridge quote'],
    } as QuoteResponse, { status: 500 });
  }
}
