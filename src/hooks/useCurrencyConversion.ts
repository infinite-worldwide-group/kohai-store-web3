"use client";

import { useState, useEffect, useCallback } from 'react';
import { Currency } from '@/components/Store/CurrencySelector';

// Mock exchange rates - in a real app, you'd fetch from an API
const MOCK_EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: {
    USD: 1,
    MYR: 4.7,
    SGD: 1.35,
    IDR: 15800,
    PHP: 56,
    THB: 36,
    VND: 24000,
    USDT: 1,
    USDC: 1,
    SOL: 0.01, // 1 USD = 0.01 SOL (assuming SOL = $100)
    ETH: 0.0004, // 1 USD = 0.0004 ETH (assuming ETH = $2500)
    BTC: 0.000023, // 1 USD = 0.000023 BTC (assuming BTC = $43000)
  }
};

export interface ConversionRates {
  [currencyCode: string]: number;
}

export interface UseCurrencyConversionReturn {
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => number | null;
  rates: ConversionRates | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshRates: (force?: boolean) => Promise<void>;
}

// Cache duration: 1 hour (exchange rates don't change that often)
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const CACHE_KEY = 'currency_exchange_rates';

export const useCurrencyConversion = (baseCurrency: string = 'USD'): UseCurrencyConversionReturn => {
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch real-time exchange rates from API
  const fetchExchangeRates = useCallback(async (base: string = 'USD'): Promise<ConversionRates> => {
    const apiKey = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY;

    try {
      // Option 1: ExchangeRate-API (Free tier: 1,500 requests/month)
      // No API key needed for free tier!
      const url = `https://api.exchangerate-api.com/v4/latest/${base}`;

      console.log('🌐 Fetching real-time exchange rates for', base);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.rates) {
        throw new Error('Invalid API response: missing rates');
      }

      console.log('✅ Exchange rates updated:', {
        base: data.base,
        date: data.date,
        sampleRates: {
          MYR: data.rates.MYR,
          SGD: data.rates.SGD,
          IDR: data.rates.IDR,
        }
      });

      // Return the rates
      return data.rates;

    } catch (error) {
      console.error('❌ Failed to fetch real-time rates, using fallback:', error);

      // Fallback to mock rates if API fails
      if (MOCK_EXCHANGE_RATES[base]) {
        console.warn('⚠️ Using hardcoded fallback rates');
        return MOCK_EXCHANGE_RATES[base];
      }

      throw new Error(`Exchange rates not available for base currency: ${base}`);
    }
  }, []);

  const refreshRates = useCallback(async (force: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      // Check cache first (unless force refresh)
      if (!force && typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { rates: cachedRates, timestamp, baseCurrency: cachedBase } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            // Use cached rates if less than 1 hour old and same base currency
            if (age < CACHE_DURATION && cachedBase === baseCurrency) {
              console.log('📦 Using cached exchange rates (age:', Math.round(age / 1000 / 60), 'minutes)');
              setRates(cachedRates);
              setLastUpdated(new Date(timestamp));
              setLoading(false);
              return;
            } else {
              console.log('🔄 Cache expired or base currency changed, fetching fresh rates');
            }
          } catch (e) {
            console.warn('Failed to parse cached rates:', e);
          }
        }
      }

      // Fetch fresh rates from API
      const newRates = await fetchExchangeRates(baseCurrency);
      setRates(newRates);
      const now = new Date();
      setLastUpdated(now);

      // Cache the rates in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            rates: newRates,
            timestamp: now.getTime(),
            baseCurrency: baseCurrency,
          }));
          console.log('💾 Cached exchange rates for 1 hour');
        } catch (e) {
          console.warn('Failed to cache rates:', e);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
      console.error('Currency conversion error:', err);
    } finally {
      setLoading(false);
    }
  }, [baseCurrency, fetchExchangeRates]);

  // Initial load and base currency change
  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  // Convert price from one currency to another
  const convertPrice = useCallback((
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): number | null => {
    if (!rates || !amount) return null;

    if (fromCurrency === toCurrency) return amount;

    console.log('💱 Converting:', {
      amount,
      from: fromCurrency,
      to: toCurrency,
      availableRates: Object.keys(rates),
      fromRate: rates[fromCurrency],
      toRate: rates[toCurrency]
    });

    // Convert from source currency to base (USD)
    let amountInBase = amount;
    if (fromCurrency !== baseCurrency) {
      const fromRate = rates[fromCurrency];
      if (!fromRate) {
        console.warn(`Exchange rate not found for ${fromCurrency}`);
        return null;
      }
      amountInBase = amount / fromRate;
      console.log(`  Step 1: ${amount} ${fromCurrency} ÷ ${fromRate} = ${amountInBase} ${baseCurrency}`);
    }

    // Convert from base to target currency
    if (toCurrency === baseCurrency) {
      console.log(`  Result: ${amountInBase} ${toCurrency}`);
      return amountInBase;
    }

    const toRate = rates[toCurrency];
    if (!toRate) {
      console.warn(`Exchange rate not found for ${toCurrency}`);
      return null;
    }

    const result = amountInBase * toRate;
    console.log(`  Step 2: ${amountInBase} ${baseCurrency} × ${toRate} = ${result} ${toCurrency}`);
    return result;
  }, [rates, baseCurrency]);

  return {
    convertPrice,
    rates,
    loading,
    error,
    lastUpdated,
    refreshRates,
  };
};

// Hook for currency display formatting
export const useCurrencyFormatter = () => {
  const formatPrice = useCallback((amount: number, currency: Currency): string => {
    const { code, symbol, type } = currency;
    
    // Format based on currency type and code
    switch (code) {
      case 'USD':
      case 'SGD':
        return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      case 'MYR':
        return `${symbol} ${amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      case 'IDR':
        return `${symbol} ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      
      case 'PHP':
        return `${symbol}${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      case 'THB':
        return `${symbol}${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      
      case 'VND':
        return `${amount.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${symbol}`;
      
      case 'SOL':
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${code}`;
      
      case 'BTC':
      case 'ETH':
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 8 })} ${code}`;
      
      case 'USDT':
      case 'USDC':
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${code}`;
      
      default:
        // Default formatting
        if (type === 'crypto') {
          return `${amount.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${code}`;
        } else {
          return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    }
  }, []);

  return { formatPrice };
};