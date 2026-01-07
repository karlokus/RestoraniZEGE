import { useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useRestaurantsContext, type SortOption } from "../contexts/RestaurantsContext";
import type { Restaurant } from "../components/RestaurantCard";
import RestaurantDetail from "../components/RestaurantDetail";
import MapView from "../components/MapView";
import "../css/Filter.css";

// Emoji ikone za različite vrste kuhinja
const cuisineIcons: Record<string, string> = {
   "Tradicionalna domaća kuhinja": "🍲",
   "Starozagrebačka gradska kuća": "🏠",
   "Fine dining s lokalnim proizvodima": "🍷",
   "Zagorska & starozagrebačka": "🥘",
   "default": "📍"
};


function Filter() {
   const { user, isAuthenticated, logout } = useAuthContext();
   const { toggleFavorite, isFavorite } = useFavoritesContext();
   const {
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
   } = useRestaurantsContext();

   // State za hover na karti
   const [hoveredRestaurant, setHoveredRestaurant] = useState<number | null>(null);

   // State za prikaz detalja restorana
   const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

   // Dropdown states
   const [showUserDropdown, setShowUserDropdown] = useState(false);

   // Inicijali korisnika
   const inicijali = (() => {
      const full = (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "").trim();
      if (!full) return "";
      const dijelovi = full.split(/\s+/);
      const ime = dijelovi[0]?.[0] ?? "";
      const prez = dijelovi.length > 1 ? dijelovi[dijelovi.length - 1][0] : (dijelovi[0]?.[1] ?? "");
      return (ime + prez).toUpperCase();
   })();

   const handleLogout = async () => {
      await logout();
   };

   const getCuisineIcon = (cuisine: string) => {
      return cuisineIcons[cuisine] || cuisineIcons["default"];
   };

   const getPriceLevelDisplay = (level: number) => {
      return "€".repeat(Math.min(Math.max(level, 1), 4));
   };

   return (
      <div className="filter-page">
         <header className="filter-header">
            <div className="header-things">
               <a href="/" className="brand-wrap">
                  <span className="header-title">RestoraniZEGE</span>
                  <span className="brand-sub">ZAGREB</span>
               </a>

               <div className="header-right">
                  {isAuthenticated ? (
                     <>
                        <div
                           className="user-dropdown"
                           onMouseEnter={() => setShowUserDropdown(true)}
                           onMouseLeave={() => setTimeout(() => {
                              setShowUserDropdown(false);
                           }, 500)}
                        >
                           <a className="user-chip" href="/profile">
                              {inicijali && (
                                 <span className="initials-badge" aria-hidden="true">{inicijali}</span>
                              )}
                              <span className="user-name">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}</span>
                           </a>
                           {showUserDropdown && (
                              <div className="dropdown-content">
                                 <button className="logout-button" onClick={handleLogout}>
                                    Odjavi se
                                 </button>
                              </div>
                           )}
                        </div>
                     </>
                  ) : (
                     <a className="login-button" href="/login">Prijavi se</a>
                  )}
               </div>
            </div>
         </header >

         < div className="filter-search-section" >
            <div className="filter-search-container">
               <span className="search-icon">🔍</span>
               <input
                  type="text"
                  placeholder="Pretražite restorane..."
                  className="filter-search-input"
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div >

         < div className="filter-controls" >
            <div className="filter-group">
               <label className="filter-label">
                  <span className="filter-icon">🍽️</span>
                  Vrsta kuhinje
               </label>
               <select
                  className="filter-select"
                  value={filters.cuisineType}
                  onChange={(e) => setCuisineType(e.target.value)}
               >
                  <option value="all">Sve kuhinje</option>
                  {cuisineTypes.map(type => (
                     <option key={type} value={type}>{type}</option>
                  ))}
               </select>
            </div>

            <div className="filter-group">
               <label className="filter-label">
                  <span className="filter-icon">⭐</span>
                  Prosječna ocjena
               </label>
               <select
                  className="filter-select"
                  value={filters.ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
               >
                  <option value="all">Sve ocjene</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="3.0">3.0+ ⭐</option>
               </select>
            </div>

            <div className="filter-group">
               <label className="filter-label">
                  <span className="filter-icon">🔥</span>
                  Raspon cijena
               </label>
               <div className="price-buttons">
                  <button
                     className={`price-btn ${filters.priceFilter === null ? 'active' : ''}`}
                     onClick={() => setPriceFilter(null)}
                  >
                     Sve
                  </button>
                  <button
                     className={`price-btn ${filters.priceFilter === 1 ? 'active' : ''}`}
                     onClick={() => setPriceFilter(1)}
                  >
                     €
                  </button>
                  <button
                     className={`price-btn ${filters.priceFilter === 2 ? 'active' : ''}`}
                     onClick={() => setPriceFilter(2)}
                  >
                     €€
                  </button>
                  <button
                     className={`price-btn ${filters.priceFilter === 3 ? 'active' : ''}`}
                     onClick={() => setPriceFilter(3)}
                  >
                     €€€
                  </button>
                  <button
                     className={`price-btn ${filters.priceFilter === 4 ? 'active' : ''}`}
                     onClick={() => setPriceFilter(4)}
                  >
                     €€€€
                  </button>
               </div>
            </div>
         </div >

         < div className="filter-main-content" >
            < div className="map-section" >
               <div className="map-container">
                  <MapView
                     restaurants={filteredRestaurants}
                     hoveredRestaurant={hoveredRestaurant}
                     onMarkerClick={(restaurant) => setSelectedRestaurant(restaurant)}
                     onMarkerHover={(restaurantId) => setHoveredRestaurant(restaurantId)}
                  />
                  <div className="map-footer">
                     Pronađeno {filteredRestaurants.length} restorana
                  </div>
               </div>
            </div >

            < div className="list-section" >
               <div className="list-header">
                  <span className="results-count">{filteredRestaurants.length} restorana</span>
                  <div className="sort-control">
                     <label>Sortiraj po:</label>
                     <select
                        className="sort-select"
                        value={filters.sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                     >
                        <option value="recommended">Preporučeno</option>
                        <option value="rating">Ocjena</option>
                        <option value="priceAsc">Cijena (niža prvo)</option>
                        <option value="priceDesc">Cijena (viša prvo)</option>
                        <option value="name">Naziv A-Z</option>
                     </select>
                  </div>
               </div>

               {
                  loading ? (
                     <div className="loading-message">Učitavanje restorana...</div>
                  ) : error ? (
                     <div className="error-message">{error}</div>
                  ) : filteredRestaurants.length === 0 ? (
                     <div className="no-results">
                        <span className="no-results-icon">🔍</span>
                        <p>Nema pronađenih restorana za zadane filtere</p>
                        <button
                           className="clear-filters-btn"
                           onClick={resetFilters}
                        >
                           Očisti filtere
                        </button>
                     </div>
                  ) : (
                     <div className="restaurant-list">
                        {filteredRestaurants.map(restaurant => (
                           <div
                              key={restaurant.id}
                              className={`restaurant-card-item ${hoveredRestaurant === restaurant.id ? 'highlighted' : ''}`}
                              onMouseEnter={() => setHoveredRestaurant(restaurant.id)}
                              onMouseLeave={() => setHoveredRestaurant(null)}
                              onClick={() => setSelectedRestaurant(restaurant)}
                           >
                              <div className="card-icon-wrapper">
                                 <span className="card-cuisine-icon">{getCuisineIcon(restaurant.cuisine)}</span>
                              </div>
                              <div className="card-content">
                                 <div className="card-header">
                                    <h3 className="card-name">{restaurant.name}</h3>
                                    {isAuthenticated && (
                                       <button
                                          className={`card-favorite ${isFavorite(restaurant.id) ? 'favorited' : ''}`}
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             toggleFavorite(restaurant.id);
                                          }}
                                       >
                                          ♥
                                       </button>
                                    )}
                                 </div>
                                 <p className="card-cuisine">{restaurant.cuisine}</p>
                                 <p className="card-location">
                                    <span className="location-icon">📍</span>
                                    {restaurant.location}
                                 </p>
                                 <div className="card-footer">
                                    <div className="card-rating">
                                       <span className="rating-star">⭐</span>
                                       <span className="rating-value">{restaurant.rating}</span>
                                    </div>
                                    <div className="card-price">
                                       {getPriceLevelDisplay(restaurant.priceLevel)}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )
               }
            </div >
         </div >

         {selectedRestaurant && (
            <RestaurantDetail
               restaurant={selectedRestaurant}
               isOpen={!!selectedRestaurant}
               onClose={() => setSelectedRestaurant(null)}
            />
         )}
      </div >
   );
}

export default Filter;
