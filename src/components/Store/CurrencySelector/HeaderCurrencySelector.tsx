"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { Currency, SUPPORTED_CURRENCIES } from '@/components/Store/CurrencySelector';
import { useCurrencyConversion, useCurrencyFormatter } from '@/hooks/useCurrencyConversion';

// Global currency context
interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (amount: number, fromCurrency: string, toCurrency: string) => number | null;
  formatPrice: (amount: number, currency: Currency) => string;
  rates: Record<string, number> | null;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Currency provider component
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES.find(c => c.code === 'USD') || SUPPORTED_CURRENCIES[0]
  );

  const { convertPrice, rates, loading } = useCurrencyConversion('USD');
  const { formatPrice } = useCurrencyFormatter();

  // Persist currency selection in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      try {
        const parsedCurrency = JSON.parse(saved);
        const currency = SUPPORTED_CURRENCIES.find(c => c.code === parsedCurrency.code);
        if (currency) {
          setSelectedCurrency(currency);
        }
      } catch (error) {
        console.warn('Failed to parse saved currency:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(selectedCurrency));
  }, [selectedCurrency]);

  return (
    <CurrencyContext.Provider 
      value={{ 
        selectedCurrency, 
        setSelectedCurrency, 
        convertPrice, 
        formatPrice, 
        rates, 
        loading 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// Hook to use currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Compact currency selector for header
const HeaderCurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.header-currency-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
  };

  // Group currencies by type
  const fiatCurrencies = SUPPORTED_CURRENCIES.filter(c => c.type === 'fiat');
  const cryptoCurrencies = SUPPORTED_CURRENCIES.filter(c => c.type === 'crypto');

  return (
    <div className="header-currency-selector relative">
      {/* Compact Currency Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20 hover:border-white/30"
        title="Change display currency"
      >
        <span className="text-lg">{selectedCurrency.flag}</span>
        <span className="font-medium text-white text-sm">{selectedCurrency.code}</span>
        <svg 
          className={`w-4 h-4 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-white/60" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-white/10 bg-white/5">
              <h3 className="text-sm font-semibold text-white">Display Currency</h3>
              <p className="text-xs text-white/60">Choose how you want to see prices</p>
            </div>

            {/* Currency Lists */}
            <div className="max-h-80 overflow-y-auto">
              {/* Fiat Currencies */}
              <div>
                <div className="px-3 py-2 bg-white/5 border-b border-white/10">
                  <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    💵 Fiat Currencies
                  </h4>
                </div>
                {fiatCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencySelect(currency)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left
                      transition-colors duration-150
                      hover:bg-blue-500/10 hover:border-l-4 hover:border-l-blue-400
                      ${selectedCurrency.code === currency.code 
                        ? 'bg-blue-500/20 border-l-4 border-l-blue-400' 
                        : ''
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">{currency.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{currency.code}</span>
                        {selectedCurrency.code === currency.code && (
                          <span className="text-xs text-blue-400">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 truncate">{currency.name}</p>
                    </div>
                    <span className="text-sm text-white/70 flex-shrink-0">{currency.symbol}</span>
                  </button>
                ))}
              </div>

              {/* Crypto Currencies */}
              <div>
                <div className="px-3 py-2 bg-white/5 border-b border-white/10">
                  <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                    🪙 Cryptocurrencies
                  </h4>
                </div>
                {cryptoCurrencies.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => handleCurrencySelect(currency)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left
                      transition-colors duration-150
                      hover:bg-blue-500/10 hover:border-l-4 hover:border-l-blue-400
                      ${selectedCurrency.code === currency.code 
                        ? 'bg-blue-500/20 border-l-4 border-l-blue-400' 
                        : ''
                      }
                    `}
                  >
                    <span className="text-lg flex-shrink-0">{currency.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{currency.code}</span>
                        {selectedCurrency.code === currency.code && (
                          <span className="text-xs text-blue-400">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 truncate">{currency.name}</p>
                    </div>
                    <span className="text-sm text-white/70 flex-shrink-0">{currency.symbol}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-white/50 text-center">
                Display currency only. Payments processed in USDT.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderCurrencySelector;