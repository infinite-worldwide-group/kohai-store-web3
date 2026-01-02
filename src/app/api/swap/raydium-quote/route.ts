import { NextRequest, NextResponse } from 'next/server';

/**
 * Raydium Quote API - Alternative to Jupiter
 * Uses Raydium's public API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputMint = searchParams.get('inputMint');
    const outputMint = searchParams.get('outputMint');
    const amount = searchParams.get('amount');

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('🌊 Trying Raydium API...');

    // Try Raydium API v3
    const raydiumUrl = `https://api-v3.raydium.io/swap/compute-swap-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=0.5`;

    const response = await fetch(raydiumUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('❌ Raydium API error:', response.status);
      throw new Error('Raydium API failed');
    }

    const data = await response.json();
    console.log('✅ Raydium quote successful');

    // Convert Raydium response to Jupiter-compatible format
    const jupiterFormat = {
      inputMint,
      inAmount: amount,
      outputMint,
      outAmount: data.outputAmount || data.amountOut,
      otherAmountThreshold: String(Math.floor((data.outputAmount || data.amountOut) * 0.995)),
      swapMode: 'ExactIn',
      slippageBps: 50,
      priceImpactPct: data.priceImpact || 0,
      routePlan: [{
        swapInfo: {
          ammKey: 'RAYDIUM',
          label: 'Raydium',
          inputMint,
          outputMint,
          inAmount: amount,
          outAmount: data.outputAmount || data.amountOut,
          feeAmount: '0',
          feeMint: inputMint,
        },
        percent: 100,
      }],
      _isRaydium: true,
    };

    return NextResponse.json(jupiterFormat);
  } catch (error: any) {
    console.error('Raydium quote error:', error);
    return NextResponse.json(
      { error: error.message || 'Raydium API unavailable' },
      { status: 503 }
    );
  }
}
