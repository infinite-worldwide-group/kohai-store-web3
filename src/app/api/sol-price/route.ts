import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
        next: {
          revalidate: 30, // Cache for 30 seconds
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const price = data?.solana?.usd;

    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko');
    }

    return NextResponse.json({
      success: true,
      price,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error fetching SOL price:', error);

    // Return fallback price on error
    return NextResponse.json(
      {
        success: false,
        price: 141.89, // Fallback price
        error: error.message,
        timestamp: Date.now(),
      },
      { status: 200 } // Still return 200 so client gets fallback
    );
  }
}
