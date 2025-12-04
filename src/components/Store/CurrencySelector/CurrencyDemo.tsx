"use client";

import { useState } from 'react';
import { CurrencySelector, Currency, SUPPORTED_CURRENCIES } from '@/components/Store/CurrencySelector';
import { useCurrencyConversion, useCurrencyFormatter } from '@/hooks/useCurrencyConversion';

const CurrencyDemo = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    SUPPORTED_CURRENCIES.find(c => c.code === 'USD') || SUPPORTED_CURRENCIES[0]
  );
  const [amount, setAmount] = useState(100);

  const { convertPrice, rates, loading } = useCurrencyConversion('USD');
  const { formatPrice } = useCurrencyFormatter();

  const convertedAmount = convertPrice(amount, 'USD', selectedCurrency.code) || amount;

  return (
    <div className="max-w-md mx-auto p-6 bg-white/10 backdrop-blur-md rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Currency Selector Demo</h2>
      
      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          Amount (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
          placeholder="Enter amount"
        />
      </div>

      {/* Currency Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          Display Currency
        </label>
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
          placeholder="Choose currency"
        />
      </div>

      {/* Converted Amount Display */}
      <div className="bg-white/5 p-4 rounded-lg border border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-white/70">Converted Amount:</span>
          {loading ? (
            <span className="text-white">Loading...</span>
          ) : (
            <span className="text-xl font-bold text-green-400">
              {formatPrice(convertedAmount, selectedCurrency)}
            </span>
          )}
        </div>
        
        {selectedCurrency.code !== 'USD' && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Original (USD):</span>
              <span className="text-white/70">${amount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {rates && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Exchange Rate:</span>
              <span className="text-white/60">
                1 USD = {rates[selectedCurrency.code]?.toFixed(6)} {selectedCurrency.code}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyDemo;