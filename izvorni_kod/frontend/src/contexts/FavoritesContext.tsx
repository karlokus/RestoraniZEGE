import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';
import { getStoredTokens } from '../services/api';

type FavoritesContextType = {
   favorites: number[];
   loading: boolean;
   toggleFavorite: (restaurantId: number) => Promise<void>;
   isFavorite: (restaurantId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
   const { isAuthenticated, refreshAccessToken } = useAuthContext();
   const [favorites, setFavorites] = useState<number[]>([]);
   const [loading, setLoading] = useState(true);

   // Load favorites when user is authenticated
   useEffect(() => {
      if (isAuthenticated) {
         loadFavorites();
      } else {
         setFavorites([]);
         setLoading(false);
      }
   }, [isAuthenticated]);

   const loadFavorites = async () => {
      try {
         const { accessToken } = getStoredTokens();

         if (!accessToken) {
            console.warn('No access token found');
            setLoading(false);
            return;
         }

         // GET /favorites 
         const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FAVORITES}`, {
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${accessToken}`,
            },
         });

         if (response.ok) {
            const data = await response.json();
            console.log('Favorites loaded:', data);

            if (data.length > 0) {
               console.log('First favorite object:', data[0]);
            }


            const restaurantIds = data.map((favorite: any) => {
               return favorite.restaurantId || favorite.restaurant?.id || favorite.id;
            }).filter((id: any) => id !== undefined);

            console.log('Extracted restaurant IDs:', restaurantIds);
            setFavorites(restaurantIds);
         } else if (response.status === 401) {
            console.error('Unauthorized - token may be expired. Please log in again.');
            const refreshed = await refreshAccessToken();
            if (refreshed) {

               loadFavorites();
            }
         } else {
            console.error('Failed to load favorites:', response.status, await response.text());
         }
      } catch (error) {
         console.error('Failed to load favorites:', error);
      } finally {
         setLoading(false);
      }
   };

   const toggleFavorite = async (restaurantId: number) => {
      try {
         const { accessToken } = getStoredTokens();

         if (!accessToken) {
            console.warn('No access token found. Please log in.');
            return;
         }

         const isFav = favorites.includes(restaurantId);

         if (isFav) {
            // DELETE /favorites/:restaurantId
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FAVORITE_BY_ID(restaurantId)}`, {
               method: 'DELETE',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
               },
            });

            if (response.ok) {
               console.log('Favorite removed:', restaurantId);
               setFavorites(prev => prev.filter(id => id !== restaurantId));
            } else if (response.status === 401) {
               console.error('Unauthorized - token may be expired. Please log in again.');
               const refreshed = await refreshAccessToken();
               if (refreshed) {
                  toggleFavorite(restaurantId);
               }
            } else {
               const errorText = await response.text();
               console.error('Failed to remove favorite:', response.status, errorText);
            }
         } else {
            // POST /favorites 
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FAVORITES}`, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
               },
               body: JSON.stringify({ restaurantId }),
            });

            if (response.ok) {
               console.log('Favorite added:', restaurantId);
               setFavorites(prev => [...prev, restaurantId]);
            } else if (response.status === 401) {
               console.error('Unauthorized - token may be expired. Please log in again.');
               const refreshed = await refreshAccessToken();
               if (refreshed) {

                  toggleFavorite(restaurantId);
               }
            } else {
               const errorText = await response.text();
               console.error('Failed to add favorite:', response.status, errorText);
            }
         }
      } catch (error) {
         console.error('Failed to toggle favorite:', error);
      }
   };

   const isFavorite = (restaurantId: number) => {
      return favorites.includes(restaurantId);
   };

   return (
      <FavoritesContext.Provider value={{
         favorites,
         loading,
         toggleFavorite,
         isFavorite
      }}>
         {children}
      </FavoritesContext.Provider>
   );
}

export function useFavoritesContext() {
   const context = useContext(FavoritesContext);
   if (context === undefined) {
      throw new Error('useFavoritesContext must be used within a FavoritesProvider');
   }
   return context;
}