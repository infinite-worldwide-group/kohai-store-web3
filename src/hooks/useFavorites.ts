/**
 * Backend-powered Favorites Hook
 *
 * USE THIS FILE AFTER BACKEND IMPLEMENTATION IS COMPLETE
 *
 * To switch from localStorage to backend:
 * 1. Backend team completes implementation (see BACKEND_FAVORITES_IMPLEMENTATION.md)
 * 2. Run: npm run codegen
 * 3. Rename this file from useFavorites.backend.ts to useFavorites.ts (replacing the old one)
 * 4. Favorites will now be stored in database and persist across devices!
 */

import { useWallet } from '@/contexts/WalletContext';
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useMyFavoritesQuery
} from 'graphql/generated/graphql';

export function useFavorites() {
  const { address: walletAddress, isConnected } = useWallet();

  // Fetch user's favorites from backend
  const { data: favoritesData, refetch } = useMyFavoritesQuery({
    skip: !isConnected || !walletAddress,
    fetchPolicy: 'cache-and-network',
  });

  const [addFavoriteMutation] = useAddFavoriteMutation();
  const [removeFavoriteMutation] = useRemoveFavoriteMutation();

  // Extract favorite product IDs for compatibility with existing code
  const favorites = favoritesData?.myFavorites?.map(product => product.id) || [];

  const toggleFavorite = async (productId: string) => {
    console.log('🔄 toggleFavorite called with:', productId);

    if (!isConnected || !walletAddress) {
      console.warn('⚠️ Wallet not connected, cannot toggle favorite');
      return;
    }

    const isFav = favorites.includes(productId);

    try {
      if (isFav) {
        console.log('❌ Removing favorite:', productId);
        await removeFavoriteMutation({
          variables: { productId },
          // Optimistic update - immediately update UI
          optimisticResponse: {
            __typename: 'Mutation',
            removeFavorite: {
              __typename: 'RemoveFavoritePayload',
              topupProduct: {
                __typename: 'TopupProduct',
                id: productId,
                isFavorite: false,
              },
              errors: [],
            },
          },
          // Update Apollo cache to trigger re-categorization
          refetchQueries: ['TopupProducts', 'MyFavorites'],
          awaitRefetchQueries: false, // Don't wait - update immediately
        });
      } else {
        console.log('❤️ Adding favorite:', productId);
        await addFavoriteMutation({
          variables: { productId },
          // Optimistic update - immediately update UI
          optimisticResponse: {
            __typename: 'Mutation',
            addFavorite: {
              __typename: 'AddFavoritePayload',
              topupProduct: {
                __typename: 'TopupProduct',
                id: productId,
                isFavorite: true,
              },
              errors: [],
            },
          },
          // Update Apollo cache to trigger re-categorization
          refetchQueries: ['TopupProducts', 'MyFavorites'],
          awaitRefetchQueries: false, // Don't wait - update immediately
        });
      }

      // Refetch favorites list to ensure UI is in sync
      await refetch();
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
    }
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
    isLoaded: true,
    walletAddress,
    isConnected,
  };
}
