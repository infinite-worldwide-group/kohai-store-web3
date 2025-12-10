# Currency Selector Component

## Overview
A comprehensive currency selector component that allows users to choose between fiat currencies and cryptocurrencies for price display.

## Features
- **Multi-currency support**: Supports both fiat (USD, MYR, SGD, etc.) and cryptocurrencies (USDT, SOL, BTC, etc.)
- **Real-time conversion**: Automatically converts prices using exchange rates
- **Search functionality**: Users can search for currencies by code or name
- **Grouped display**: Currencies are grouped by type (fiat vs crypto)
- **Responsive design**: Works on both desktop and mobile
- **Accessibility**: Keyboard navigation and screen reader friendly

## Usage

### Basic Usage
```tsx
import { CurrencySelector, Currency } from '@/components/Store/CurrencySelector';

const [selectedCurrency, setSelectedCurrency] = useState<Currency>();

<CurrencySelector
  selectedCurrency={selectedCurrency}
  onCurrencyChange={setSelectedCurrency}
/>
```

### With Currency Conversion
```tsx
import { useCurrencyConversion, useCurrencyFormatter } from '@/hooks/useCurrencyConversion';

const { convertPrice } = useCurrencyConversion('USD');
const { formatPrice } = useCurrencyFormatter();

const convertedPrice = convertPrice(100, 'USD', selectedCurrency.code);
const formattedPrice = formatPrice(convertedPrice, selectedCurrency);
```

## Implementation in PurchaseForm

The currency selector has been integrated into the PurchaseForm component with the following features:

1. **Display Currency Selection**: Users can choose how they want to see prices displayed
2. **Real-time Conversion**: Prices are automatically converted from USD to the selected currency
3. **Payment Clarity**: Clear indication that payment is still processed in USDT regardless of display currency
4. **Exchange Rate Updates**: Automatic fetching and updating of exchange rates

## Available Currencies

### Fiat Currencies
- USD (US Dollar) - $
- MYR (Malaysian Ringgit) - RM
- SGD (Singapore Dollar) - S$
- IDR (Indonesian Rupiah) - Rp
- PHP (Philippine Peso) - ₱
- THB (Thai Baht) - ฿
- VND (Vietnamese Dong) - ₫

### Cryptocurrencies
- USDT (Tether) - ₮
- USDC (USD Coin) - USDC
- SOL (Solana) - SOL
- ETH (Ethereum) - Ξ
- BTC (Bitcoin) - ₿

## API Integration

The currency conversion uses mock exchange rates for demonstration. In production, you should:

1. Replace mock rates with real API calls (e.g., CoinGecko, ExchangeRates.io)
2. Implement proper error handling for API failures
3. Add caching and rate limiting for API requests
4. Consider WebSocket connections for real-time rate updates

## Testing

You can test the currency selector by:

1. Navigating to any product page with the PurchaseForm
2. Using the "Display Currency" selector to change currencies
3. Observing how prices update in real-time
4. Searching for currencies in the dropdown
5. Noting that payment is still processed in USDT