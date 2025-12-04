"use client";

import { useState, useEffect } from "react";
// Simple ChevronDown icon component to avoid external dependency issues
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
  type: 'fiat' | 'crypto';
}

// Predefined currencies - can be extended or made dynamic
const SUPPORTED_CURRENCIES: Currency[] = [
  // Fiat currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', type: 'fiat' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', type: 'fiat' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', type: 'fiat' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', type: 'fiat' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', type: 'fiat' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', type: 'fiat' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', type: 'fiat' },
  
  // Crypto currencies
  { code: 'USDT', name: 'Tether', symbol: '₮', flag: '💰', type: 'crypto' },
  { code: 'USDC', name: 'USD Coin', symbol: 'USDC', flag: '🪙', type: 'crypto' },
  { code: 'SOL', name: 'Solana', symbol: 'SOL', flag: '🟣', type: 'crypto' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '🔷', type: 'crypto' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', flag: '🟠', type: 'crypto' },
];

export interface CurrencySelectorProps {
  selectedCurrency?: Currency;
  onCurrencyChange: (currency: Currency) => void;
  supportedCurrencies?: Currency[];
  showCryptoOnly?: boolean;
  showFiatOnly?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  supportedCurrencies = SUPPORTED_CURRENCIES,
  showCryptoOnly = false,
  showFiatOnly = false,
  disabled = false,
  className = "",
  placeholder = "Select currency"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter currencies based on type and search term
  const filteredCurrencies = supportedCurrencies.filter(currency => {
    if (showCryptoOnly && currency.type !== 'crypto') return false;
    if (showFiatOnly && currency.type !== 'fiat') return false;
    
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      return (
        currency.code.toLowerCase().includes(search) ||
        currency.name.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  // Group currencies by type
  const groupedCurrencies = filteredCurrencies.reduce((acc, currency) => {
    if (!acc[currency.type]) {
      acc[currency.type] = [];
    }
    acc[currency.type].push(currency);
    return acc;
  }, {} as Record<string, Currency[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-selector')) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCurrencySelect = (currency: Currency) => {
    onCurrencyChange(currency);
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`currency-selector relative ${className}`}>
      {/* Selected Currency Display */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3 
          rounded-xl bg-white/5 border border-white/20
          text-left transition-all duration-200
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-white/10 hover:border-white/30 focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
          }
          ${isOpen ? 'ring-2 ring-blue-400 border-blue-400' : ''}
        `}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {selectedCurrency ? (
            <>
              <span className="text-2xl flex-shrink-0">{selectedCurrency.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{selectedCurrency.code}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {selectedCurrency.type}
                  </span>
                </div>
                <p className="text-sm text-white/70 truncate">{selectedCurrency.name}</p>
              </div>
              <span className="text-lg text-white/80 flex-shrink-0">{selectedCurrency.symbol}</span>
            </>
          ) : (
            <span className="text-white/60">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-white/60 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-white/10">
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                autoFocus
              />
            </div>

            {/* Currency List */}
            <div className="max-h-80 overflow-y-auto">
              {Object.keys(groupedCurrencies).length === 0 ? (
                <div className="p-4 text-center text-white/60">
                  No currencies found
                </div>
              ) : (
                Object.entries(groupedCurrencies).map(([type, currencies]) => (
                  <div key={type}>
                    {/* Type Header */}
                    <div className="px-4 py-2 bg-white/5 border-b border-white/10">
                      <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                        {type === 'fiat' ? '💵 Fiat Currencies' : '🪙 Cryptocurrencies'}
                      </h4>
                    </div>
                    
                    {/* Currency Options */}
                    {currencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => handleCurrencySelect(currency)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 text-left
                          transition-colors duration-150
                          hover:bg-blue-500/10 hover:border-l-4 hover:border-l-blue-400
                          ${selectedCurrency?.code === currency.code 
                            ? 'bg-blue-500/20 border-l-4 border-l-blue-400' 
                            : ''
                          }
                        `}
                      >
                        <span className="text-2xl flex-shrink-0">{currency.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{currency.code}</span>
                            {selectedCurrency?.code === currency.code && (
                              <span className="text-xs text-blue-400">✓ Selected</span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 truncate">{currency.name}</p>
                        </div>
                        <span className="text-lg text-white/80 flex-shrink-0">{currency.symbol}</span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
export { SUPPORTED_CURRENCIES };