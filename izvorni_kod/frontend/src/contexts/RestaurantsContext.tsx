import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../services/api";
import type { Restaurant } from "../components/RestaurantCard";

// Sortiranje opcije
export type SortOption = "recommended" | "rating" | "priceAsc" | "priceDesc" | "name";

interface Filters {
   searchQuery: string;
   cuisineType: string;
   ratingFilter: string;
   priceFilter: number | null;
   sortBy: SortOption;
}

interface RestaurantsContextType {
   // Podaci
   restaurants: Restaurant[];
   filteredRestaurants: Restaurant[];
   loading: boolean;
   error: string | null;

   // Filteri
   filters: Filters;
   setSearchQuery: (query: string) => void;
   setCuisineType: (type: string) => void;
   setRatingFilter: (rating: string) => void;
   setPriceFilter: (price: number | null) => void;
   setSortBy: (sort: SortOption) => void;
   resetFilters: () => void;

   // Pomoćne funkcije
   cuisineTypes: string[];
   refreshRestaurants: () => Promise<void>;
}

const defaultFilters: Filters = {
   searchQuery: "",
   cuisineType: "all",
   ratingFilter: "all",
   priceFilter: null,
   sortBy: "recommended"
};

const RestaurantsContext = createContext<RestaurantsContextType | undefined>(undefined);

export function RestaurantsProvider({ children }: { children: ReactNode }) {
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Filter states
   const [filters, setFilters] = useState<Filters>(defaultFilters);

   // Učitaj restorane s backend-a
   const loadRestaurants = useCallback(async () => {
      try {
         setLoading(true);
         const data = await api.getRestaurants();
         // Mapiraj backend podatke na frontend Restaurant tip
         const mappedRestaurants: Restaurant[] = data.map((r: any) => ({
            id: r.id,
            name: r.name || '',
            cuisine: r.role || r.cuisineType || r.cuisine || '',
            location: r.adress || r.city || r.location || '',
            rating: r.rating || 0,
            priceLevel: r.priceLevel || 0,
            imageUrl: r.imageUrl || '',
         }));
         setRestaurants(mappedRestaurants);
         setError(null);
      } catch (err: any) {
         console.error('Failed to load restaurants:', err);
         setError("Neuspješno učitavanje restorana. Pokušajte ponovno.");
         setRestaurants([]);
      } finally {
         setLoading(false);
      }
   }, []);

   // Učitaj restorane prilikom prvog renderiranja
   useEffect(() => {
      loadRestaurants();
   }, [loadRestaurants]);

   // Filtriraj i sortiraj restorane kad se promijene filteri ili restorani
   useEffect(() => {
      let result = [...restaurants];

      // Pretraživanje po imenu, kuhinji ili lokaciji
      if (filters.searchQuery.trim()) {
         const query = filters.searchQuery.toLowerCase();
         result = result.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.cuisine.toLowerCase().includes(query) ||
            r.location.toLowerCase().includes(query)
         );
      }

      // Filter po vrsti kuhinje
      if (filters.cuisineType !== "all") {
         result = result.filter(r => r.cuisine === filters.cuisineType);
      }

      // Filter po minimalnoj ocjeni
      if (filters.ratingFilter !== "all") {
         const minRating = parseFloat(filters.ratingFilter);
         result = result.filter(r => r.rating >= minRating);
      }

      // Filter po maksimalnoj cijeni
      if (filters.priceFilter !== null) {
         result = result.filter(r => r.priceLevel <= filters.priceFilter!);
      }

      // Sortiranje
      switch (filters.sortBy) {
         case "rating":
            result.sort((a, b) => b.rating - a.rating);
            break;
         case "priceAsc":
            result.sort((a, b) => a.priceLevel - b.priceLevel);
            break;
         case "priceDesc":
            result.sort((a, b) => b.priceLevel - a.priceLevel);
            break;
         case "name":
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
         case "recommended":
         default:
            // Preporučeno - sortiranje po ocjeni
            result.sort((a, b) => b.rating - a.rating);
            break;
      }

      setFilteredRestaurants(result);
   }, [restaurants, filters]);

   // Dohvati sve jedinstvene tipove kuhinje
   const cuisineTypes = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));

   // Setter funkcije za pojedinačne filtere
   const setSearchQuery = useCallback((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query }));
   }, []);

   const setCuisineType = useCallback((type: string) => {
      setFilters(prev => ({ ...prev, cuisineType: type }));
   }, []);

   const setRatingFilter = useCallback((rating: string) => {
      setFilters(prev => ({ ...prev, ratingFilter: rating }));
   }, []);

   const setPriceFilter = useCallback((price: number | null) => {
      setFilters(prev => ({ ...prev, priceFilter: price }));
   }, []);

   const setSortBy = useCallback((sort: SortOption) => {
      setFilters(prev => ({ ...prev, sortBy: sort }));
   }, []);

   const resetFilters = useCallback(() => {
      setFilters(defaultFilters);
   }, []);

   const value: RestaurantsContextType = {
      restaurants,
      filteredRestaurants,
      loading,
      error,
      filters,
      setSearchQuery,
      setCuisineType,
      setRatingFilter,
      setPriceFilter,
      setSortBy,
      resetFilters,
      cuisineTypes,
      refreshRestaurants: loadRestaurants,
   };

   return (
      <RestaurantsContext.Provider value={value}>
         {children}
      </RestaurantsContext.Provider>
   );
}

export function useRestaurantsContext() {
   const context = useContext(RestaurantsContext);
   if (context === undefined) {
      throw new Error("useRestaurantsContext must be used within a RestaurantsProvider");
   }
   return context;
}
