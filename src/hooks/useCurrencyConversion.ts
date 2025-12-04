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
  refreshRates: () => Promise<void>;
}

export const useCurrencyConversion = (baseCurrency: string = 'USD'): UseCurrencyConversionReturn => {
  const [rates, setRates] = useState<ConversionRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock API call to fetch exchange rates
  const fetchExchangeRates = useCallback(async (base: string = 'USD'): Promise<ConversionRates> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real app, you would call an actual exchange rate API here
    // For example: CoinGecko API, ExchangeRates API, etc.
    
    if (MOCK_EXCHANGE_RATES[base]) {
      return MOCK_EXCHANGE_RATES[base];
    }
    
    throw new Error(`Exchange rates not available for base currency: ${base}`);
  }, []);

  const refreshRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newRates = await fetchExchangeRates(baseCurrency);
      setRates(newRates);
      setLastUpdated(new Date());
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

    // Convert from source currency to base (USD)
    let amountInBase = amount;
    if (fromCurrency !== baseCurrency) {
      const fromRate = rates[fromCurrency];
      if (!fromRate) {
        console.warn(`Exchange rate not found for ${fromCurrency}`);
        return null;
      }
      amountInBase = amount / fromRate;
    }

    // Convert from base to target currency
    if (toCurrency === baseCurrency) {
      return amountInBase;
    }

    const toRate = rates[toCurrency];
    if (!toRate) {
      console.warn(`Exchange rate not found for ${toCurrency}`);
      return null;
    }

    return amountInBase * toRate;
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