import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

type FavoritesContextType = {
   favorites: number[]; // Array of restaurant IDs
   loading: boolean;
   toggleFavorite: (restaurantId: number) => Promise<void>;
   isFavorite: (restaurantId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
   const { isAuthenticated } = useAuthContext();
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
         const response = await fetch('http://localhost:3000/api/favorites', {
            credentials: 'include',
         });

         if (response.ok) {
            const data = await response.json();
            setFavorites(data.restaurantIds || []);
         }
      } catch (error) {
         console.error('Failed to load favorites:', error);
      } finally {
         setLoading(false);
      }
   };

   const toggleFavorite = async (restaurantId: number) => {
      try {
         const isFav = favorites.includes(restaurantId);
         const method = isFav ? 'DELETE' : 'POST';

         const response = await fetch(`http://localhost:3000/api/favorites/${restaurantId}`, {
            method,
            credentials: 'include',
         });

         if (response.ok) {
            setFavorites(prev =>
               isFav
                  ? prev.filter(id => id !== restaurantId)
                  : [...prev, restaurantId]
            );
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