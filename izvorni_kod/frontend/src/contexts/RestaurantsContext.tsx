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

// Pagination podaci
export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
   totalPages: number;
}

interface RestaurantsContextType {
   // Podaci
   restaurants: Restaurant[];
   filteredRestaurants: Restaurant[];
   loading: boolean;
   error: string | null;

   // Paginacija
   pagination: PaginationMeta;
   currentPage: number;
   setCurrentPage: (page: number) => void;
   itemsPerPage: number;
   setItemsPerPage: (limit: number) => void;

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

const defaultPagination: PaginationMeta = {
   total: 0,
   page: 1,
   limit: 12,
   totalPages: 0
};

const RestaurantsContext = createContext<RestaurantsContextType | undefined>(undefined);

export function RestaurantsProvider({ children }: { children: ReactNode }) {
   const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
   const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Pagination states
   const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(12);

   // Filter states
   const [filters, setFilters] = useState<Filters>(defaultFilters);

   // Učitaj restorane s backend-a koristeći search endpoint s paginacijom
   const loadRestaurants = useCallback(async () => {
      try {
         setLoading(true);

         let backendSortBy = 'name';
         let backendOrder: 'ASC' | 'DESC' = 'ASC';

         switch (filters.sortBy) {
            case 'rating':
            case 'recommended':
               backendSortBy = 'averageRating';
               backendOrder = 'DESC';
               break;
            case 'priceAsc':
               backendSortBy = 'priceRange';
               backendOrder = 'ASC';
               break;
            case 'priceDesc':
               backendSortBy = 'priceRange';
               backendOrder = 'DESC';
               break;
            case 'name':
               backendSortBy = 'name';
               backendOrder = 'ASC';
               break;
            default:
               backendSortBy = 'name';
         }

         // Koristimo search endpoint za paginaciju
         const response = await api.searchRestaurants({
            search: filters.searchQuery || undefined,
            cuisineType: filters.cuisineType !== 'all' ? filters.cuisineType : undefined,
            minRating: filters.ratingFilter !== 'all' ? parseFloat(filters.ratingFilter) : undefined,
            maxPriceRange: filters.priceFilter !== null ? filters.priceFilter : undefined,
            verifiedOnly: true,
            page: currentPage,
            limit: itemsPerPage,
            sortBy: backendSortBy,
            sortOrder: backendOrder,
         });

         const mappedRestaurants: Restaurant[] = response.data.map((r: any) => {
            let imageUrl = r.imageUrl || '';
            if (r.photos && Array.isArray(r.photos) && r.photos.length > 0) {
               const primaryPhoto = r.photos.find((p: any) => p.isPrimary);
               imageUrl = primaryPhoto?.photoUrl || r.photos[0]?.photoUrl || imageUrl;
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
            };
         });

         setRestaurants(mappedRestaurants);
         setFilteredRestaurants(mappedRestaurants);
         setPagination(response.meta);
         setError(null);
      } catch (err: any) {
         console.error('Failed to load restaurants:', err);
         setError("Neuspješno učitavanje restorana. Pokušajte ponovno.");
         setRestaurants([]);
         setFilteredRestaurants([]);
      } finally {
         setLoading(false);
      }
   }, [currentPage, itemsPerPage, filters.searchQuery, filters.cuisineType, filters.ratingFilter, filters.priceFilter, filters.sortBy]);

   // Učitaj restorane prilikom prvog renderiranja ili kad se promijene filteri/paginacija
   useEffect(() => {
      loadRestaurants();
   }, [loadRestaurants]);

   // Kad se promijene filteri, resetiraj na prvu stranicu
   const handleFilterChange = useCallback(() => {
      setCurrentPage(1);
   }, []);

   // Dohvati sve jedinstvene tipove kuhinje
   const cuisineTypes = Array.from(new Set(restaurants.map(r => r.cuisine).filter(Boolean)));

   // Setter funkcije za pojedinačne filtere
   const setSearchQuery = useCallback((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query }));
      handleFilterChange();
   }, [handleFilterChange]);

   const setCuisineType = useCallback((type: string) => {
      setFilters(prev => ({ ...prev, cuisineType: type }));
      handleFilterChange();
   }, [handleFilterChange]);

   const setRatingFilter = useCallback((rating: string) => {
      setFilters(prev => ({ ...prev, ratingFilter: rating }));
      handleFilterChange();
   }, [handleFilterChange]);

   const setPriceFilter = useCallback((price: number | null) => {
      setFilters(prev => ({ ...prev, priceFilter: price }));
      handleFilterChange();
   }, [handleFilterChange]);

   const setSortBy = useCallback((sort: SortOption) => {
      setFilters(prev => ({ ...prev, sortBy: sort }));
      handleFilterChange();
   }, [handleFilterChange]);

   const resetFilters = useCallback(() => {
      setFilters(defaultFilters);
      setCurrentPage(1);
   }, []);

   const handleSetCurrentPage = useCallback((page: number) => {
      setCurrentPage(page);
   }, []);

   const handleSetItemsPerPage = useCallback((limit: number) => {
      setItemsPerPage(limit);
      setCurrentPage(1); // Resetiraj na prvu stranicu kad se promijeni broj stavki po stranici
   }, []);

   const value: RestaurantsContextType = {
      restaurants,
      filteredRestaurants,
      loading,
      error,
      pagination,
      currentPage,
      setCurrentPage: handleSetCurrentPage,
      itemsPerPage,
      setItemsPerPage: handleSetItemsPerPage,
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
