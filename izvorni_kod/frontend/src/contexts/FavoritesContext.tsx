import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';
import { getStoredTokens } from '../services/api';
import type { Restaurant } from '../components/RestaurantCard';

type FavoritesContextType = {
   favorites: number[];
   favoriteRestaurants: Restaurant[];
   loading: boolean;
   loadingRestaurants: boolean;
   toggleFavorite: (restaurantId: number) => Promise<void>;
   isFavorite: (restaurantId: number) => boolean;
   loadFavoriteRestaurants: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
   const { isAuthenticated, refreshAccessToken } = useAuthContext();
   const [favorites, setFavorites] = useState<number[]>([]);
   const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
   const [loading, setLoading] = useState(true);
   const [loadingRestaurants, setLoadingRestaurants] = useState(false);

   // Load favorites when user is authenticated
   useEffect(() => {
      if (isAuthenticated) {
         loadFavorites();
      } else {
         setFavorites([]);
         setFavoriteRestaurants([]);
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

   // Funkcija za dohvaćanje svih favorita restorana s potpunim podacima
   const loadFavoriteRestaurants = async () => {
      if (favorites.length === 0) {
         setFavoriteRestaurants([]);
         return;
      }

      try {
         setLoadingRestaurants(true);
         const { accessToken } = getStoredTokens();

         if (!accessToken) {
            console.warn('No access token found');
            return;
         }

         // Dohvati detalje za svaki favorit restoran
         const restaurantPromises = favorites.map(async (restaurantId) => {
            try {
               // Dohvati osnovne podatke o restoranu
               const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}`, {
                  headers: {
                     'Content-Type': 'application/json',
                  },
               });

               if (response.ok) {
                  const r = await response.json();
                  
                  let imageUrl = r.imageUrl || '';
                  
                  // Provjeri photos iz osnovnog responsa
                  if (r.photos && Array.isArray(r.photos) && r.photos.length > 0) {
                     const primaryPhoto = r.photos.find((p: any) => p.isPrimary);
                     imageUrl = primaryPhoto?.photoUrl || r.photos[0]?.photoUrl || imageUrl;
                  }
                  
                  // Ako nema slike, dohvati slike zasebno
                  if (!imageUrl) {
                     try {
                        const photosResponse = await fetch(`${API_BASE_URL}/restaurant-photos/restaurant/${restaurantId}`, {
                           headers: {
                              'Content-Type': 'application/json',
                           },
                        });
                        
                        if (photosResponse.ok) {
                           const photos = await photosResponse.json();
                           if (Array.isArray(photos) && photos.length > 0) {
                              const primaryPhoto = photos.find((p: any) => p.isPrimary);
                              imageUrl = primaryPhoto?.photoUrl || photos[0]?.photoUrl || '';
                           }
                        }
                     } catch (photoErr) {
                        console.error(`Failed to fetch photos for restaurant ${restaurantId}:`, photoErr);
                     }
                  }

                  return {
                     id: r.id,
                     name: r.name || '',
                     cuisine: r.cuisineType || r.cuisine || '',
                     location: r.adress ? `${r.adress}${r.city ? ', ' + r.city : ''}` : (r.city || r.location || ''),
                     rating: r.averageRating || r.rating || 0,
                     priceLevel: r.priceRange || r.priceLevel || 2,
                     imageUrl: imageUrl,
                     latitude: r.latitude,
                     longitude: r.longitude,
                  } as Restaurant;
               }
               return null;
            } catch (err) {
               console.error(`Failed to fetch restaurant ${restaurantId}:`, err);
               return null;
            }
         });

         const results = await Promise.all(restaurantPromises);
         const validRestaurants = results.filter((r): r is Restaurant => r !== null);
         setFavoriteRestaurants(validRestaurants);
      } catch (error) {
         console.error('Failed to load favorite restaurants:', error);
      } finally {
         setLoadingRestaurants(false);
      }
   };

   return (
      <FavoritesContext.Provider value={{
         favorites,
         favoriteRestaurants,
         loading,
         loadingRestaurants,
         toggleFavorite,
         isFavorite,
         loadFavoriteRestaurants
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