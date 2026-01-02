import { NextRequest, NextResponse } from 'next/server';

/**
 * Multi-DEX Swap Transaction API Proxy
 * Supports Jupiter, Orca, and other DEX aggregators
 */

// Try multiple Jupiter API endpoints for swap
const JUPITER_SWAP_ENDPOINTS = [
  'https://quote-api.jup.ag/v6/swap',
  'https://api.jup.ag/swap/v6',
  'https://public.jupiterapi.com/swap/v6',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteResponse, userPublicKey } = body;

    if (!quoteResponse || !userPublicKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if this is a fallback quote (no real DEX backing)
    if (quoteResponse._isFallback || quoteResponse._isCoinGecko) {
      return NextResponse.json(
        {
          error: 'Cannot execute swap with estimated pricing. Please try again later when DEX APIs are available.',
          isFallback: true
        },
        { status: 400 }
      );
    }

    // Handle Orca quotes
    if (quoteResponse._isOrca) {
      console.log('🐳 Using Orca for swap transaction...');

      try {
        // Orca swap API
        const orcaSwapUrl = 'https://api.mainnet.orca.so/v1/swap';

        const orcaResponse = await fetch(orcaSwapUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputMint: quoteResponse.inputMint,
            outputMint: quoteResponse.outputMint,
            amount: quoteResponse.inAmount,
            slippage: 0.5,
            userPublicKey,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (orcaResponse.ok) {
          const orcaData = await orcaResponse.json();
          console.log('✅ Orca swap transaction created successfully');

          // Return in Jupiter-compatible format
          return NextResponse.json({
            swapTransaction: orcaData.transaction || orcaData.swapTransaction,
            _isOrca: true,
          });
        }

        console.error('❌ Orca swap API error:', orcaResponse.status);
      } catch (orcaError: any) {
        console.error('❌ Orca swap failed:', orcaError.message);
      }
    }

    // Handle Jupiter quotes (try multiple endpoints)
    const requestBody = JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      computeUnitPriceMicroLamports: 'auto',
    });

    let lastError: any = null;

    for (const endpoint of JUPITER_SWAP_ENDPOINTS) {
      try {
        console.log(`Trying Jupiter swap endpoint: ${endpoint}`);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: requestBody,
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Swap transaction successful from:', endpoint);
          return NextResponse.json(data);
        }

        const errorText = await response.text();
        console.error(`❌ Jupiter Swap API error (${endpoint}):`, response.status, errorText);
        lastError = new Error(`Jupiter Swap API returned ${response.status}`);
      } catch (err: any) {
        console.error(`❌ Failed to reach ${endpoint}:`, err.message);
        lastError = err;
        continue; // Try next endpoint
      }
    }

    // All endpoints failed
    return NextResponse.json(
      {
        error: 'Unable to create swap transaction. All DEX APIs are temporarily unavailable.',
        details: lastError?.message
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Swap transaction API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

