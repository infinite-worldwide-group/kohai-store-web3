import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';

const FAVORITES_KEY = 'topupProductFavorites';

export function useFavorites() {
  const { address: walletAddress, isConnected } = useWallet();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount or when wallet changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('🔄 useFavorites effect triggered:', { walletAddress, isConnected });

    if (!isConnected || !walletAddress) {
      // No wallet connected - keep current favorites (don't clear)
      console.log('⚠️ Wallet not connected, keeping current favorites');
      setIsLoaded(true);
      return;
    }

    // Wallet is connected - load wallet-specific favorites
    const storageKey = `${FAVORITES_KEY}_${walletAddress}`;
    console.log('📂 Loading favorites from:', storageKey);

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('✅ Loaded favorites:', parsed, 'Count:', parsed.length);
        setFavorites([...parsed]); // Create new array reference
      } catch (e) {
        console.error('❌ Failed to parse favorites:', e);
        setFavorites([]);
      }
    } else {
      console.log('📭 No favorites found in storage');
      setFavorites([]);
    }

    setIsLoaded(true);
  }, [walletAddress, isConnected]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    if (!isConnected || !walletAddress) {
      console.log('⚠️ Skipping save - wallet not connected');
      return;
    }

    const storageKey = `${FAVORITES_KEY}_${walletAddress}`;
    console.log('💾 Saving favorites to:', storageKey, favorites);
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, isLoaded, walletAddress, isConnected]);

  const toggleFavorite = (productId: string) => {
    console.log('🔄 toggleFavorite called with:', productId);

    setFavorites(prev => {
      const isCurrentlyFavorite = prev.includes(productId);
      let newFavorites: string[];

      if (isCurrentlyFavorite) {
        console.log('❌ Removing favorite:', productId);
        newFavorites = prev.filter(id => id !== productId);
      } else {
        console.log('❤️ Adding favorite:', productId);
        newFavorites = [...prev, productId];
      }

      console.log('📊 Favorites updated:', {
        before: prev.length,
        after: newFavorites.length,
        productId,
        action: isCurrentlyFavorite ? 'removed' : 'added',
        newArray: newFavorites
      });

      // Return new array
      return newFavorites;
    });
  };

  const isFavorite = (productId: string) => {
    const result = favorites.includes(productId);
    if (result) {
      console.log('✅ Product', productId, 'is in favorites');
    }
    return result;
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    isLoaded,
    walletAddress,
    isConnected,
  };
}
