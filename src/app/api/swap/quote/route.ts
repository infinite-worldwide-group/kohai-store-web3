import { NextRequest, NextResponse } from 'next/server';

/**
 * Jupiter Quote API Proxy
 * Avoids CORS issues by calling Jupiter from server-side
 */

// Jupiter API endpoint
const JUPITER_QUOTE_URL = 'https://quote-api.jup.ag/v6/quote';

// Fallback: Use simple pricing calculation
// SOL/USDT typical rate (this is a fallback, not accurate live pricing)
const FALLBACK_RATES: Record<string, number> = {
  'So11111111111111111111111111111111111111112-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 140, // SOL to USDT ~$140
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB-So11111111111111111111111111111111111111112': 0.00714, // USDT to SOL
  'So11111111111111111111111111111111111111112-EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 140, // SOL to USDC
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v-So11111111111111111111111111111111111111112': 0.00714, // USDC to SOL
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputMint = searchParams.get('inputMint');
    const outputMint = searchParams.get('outputMint');
    const amount = searchParams.get('amount');
    const slippageBps = searchParams.get('slippageBps') || '50';

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const params = `inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    // Try Jupiter first
    try {
      console.log(`Trying Jupiter API...`);
      const jupiterUrl = `${JUPITER_QUOTE_URL}?${params}`;

      const response = await fetch(jupiterUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quote successful from Jupiter');
        return NextResponse.json(data);
      }

      console.error(`❌ Jupiter API error:`, response.status);
    } catch (jupiterError: any) {
      console.error(`❌ Jupiter failed:`, jupiterError.message);
    }

    // Try Orca as second option
    try {
      console.log('🐳 Trying Orca API...');
      // Orca has a simpler public quote API
      const orcaUrl = `https://api.mainnet.orca.so/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippage=50`;

      const orcaResponse = await fetch(orcaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (orcaResponse.ok) {
        const orcaData = await orcaResponse.json();
        console.log('✅ Quote successful from Orca');
        console.log('📦 Orca raw response:', JSON.stringify(orcaData));

        // Extract output amount from various possible field names
        const outputAmount =
          orcaData.expectedOutputAmount ||
          orcaData.outAmount ||
          orcaData.outputAmount ||
          orcaData.estimatedAmountOut ||
          orcaData.amountOut ||
          orcaData.quote?.outAmount;

        if (!outputAmount) {
          console.error('❌ Could not find output amount in Orca response');
          throw new Error('Orca response missing output amount');
        }

        console.log('💰 Orca output amount:', outputAmount);

        // Convert to Jupiter-compatible format
        const jupiterFormat = {
          inputMint,
          inAmount: amount,
          outputMint,
          outAmount: String(outputAmount),
          otherAmountThreshold: String(Math.floor(Number(outputAmount) * 0.995)),
          swapMode: 'ExactIn',
          slippageBps: 50,
          priceImpactPct: orcaData.priceImpact || 0,
          routePlan: [{
            swapInfo: {
              ammKey: 'ORCA',
              label: 'Orca',
              inputMint,
              outputMint,
              inAmount: amount,
              outAmount: String(outputAmount),
              feeAmount: '0',
              feeMint: inputMint,
            },
            percent: 100,
          }],
          _isOrca: true,
        };

        console.log('✅ Returning Orca quote with outAmount:', jupiterFormat.outAmount);
        return NextResponse.json(jupiterFormat);
      }

      console.error(`❌ Orca API error:`, orcaResponse.status);
    } catch (orcaError: any) {
      console.error(`❌ Orca failed:`, orcaError.message);
    }

    // Try fetching price from CoinGecko as third option
    try {
      console.log('🦎 Trying CoinGecko price API...');

      // Only works for SOL/USDT swap
      if (inputMint === 'So11111111111111111111111111111111111111112' &&
          (outputMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' ||
           outputMint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')) {

        const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000),
        });

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          const solPrice = priceData.solana?.usd;

          if (solPrice) {
            console.log(`✅ Got SOL price from CoinGecko: $${solPrice}`);

            const inputAmount = parseInt(amount);
            const outputDecimals = outputMint === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' ? 6 : 6; // USDT/USDC both 6 decimals
            const inputInSol = inputAmount / 1e9; // SOL has 9 decimals
            const outputInUsd = inputInSol * solPrice;
            const outputAmount = Math.floor(outputInUsd * Math.pow(10, outputDecimals));

            const coingeckoQuote = {
              inputMint,
              inAmount: amount,
              outputMint,
              outAmount: String(outputAmount),
              otherAmountThreshold: String(Math.floor(outputAmount * 0.995)),
              swapMode: 'ExactIn',
              slippageBps: 50,
              priceImpactPct: 0.001,
              routePlan: [{
                swapInfo: {
                  ammKey: 'COINGECKO',
                  label: `CoinGecko Price`,
                  inputMint,
                  outputMint,
                  inAmount: amount,
                  outAmount: String(outputAmount),
                  feeAmount: '0',
                  feeMint: inputMint,
                },
                percent: 100,
              }],
              _isCoinGecko: true,
            };

            return NextResponse.json(coingeckoQuote);
          }
        }
      }

      console.error(`❌ CoinGecko pricing unavailable`);
    } catch (coinGeckoError: any) {
      console.error(`❌ CoinGecko failed:`, coinGeckoError.message);
    }

    // Fallback: Use estimated rates
    console.log('⚠️ All DEX APIs unavailable, using fallback pricing...');

    const rateKey = `${inputMint}-${outputMint}`;
    const rate = FALLBACK_RATES[rateKey];

    if (!rate) {
      return NextResponse.json(
        { error: 'Swap pair not supported. Currently only SOL↔USDT and SOL↔USDC are available.' },
        { status: 400 }
      );
    }

    // Calculate output amount using fallback rate
    const inputAmount = parseInt(amount);
    const outputAmount = Math.floor(inputAmount * rate);

    // Create a Jupiter-compatible quote response
    const fallbackQuote = {
      inputMint,
      inAmount: amount,
      outputMint,
      outAmount: String(outputAmount),
      otherAmountThreshold: String(Math.floor(outputAmount * 0.995)), // 0.5% slippage
      swapMode: 'ExactIn',
      slippageBps: parseInt(slippageBps),
      priceImpactPct: 0.001, // Estimated 0.1%
      routePlan: [
        {
          swapInfo: {
            ammKey: 'FALLBACK',
            label: 'Estimated Rate',
            inputMint,
            outputMint,
            inAmount: amount,
            outAmount: String(outputAmount),
            feeAmount: '0',
            feeMint: inputMint,
          },
          percent: 100,
        },
      ],
      _isFallback: true, // Flag to indicate this is fallback pricing
    };

    console.log('💡 Using fallback quote with rate:', rate);
    return NextResponse.json(fallbackQuote);
  } catch (error: any) {
    console.error('Quote API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

