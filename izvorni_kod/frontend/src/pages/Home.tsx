import { useState, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useEventsContext } from "../contexts/EventsContext";
import RestaurantCard, { type Restaurant } from "../components/RestaurantCard"
import userImg from "../assets/user.png"
import "../css/Home.css"

function Home() {
   const { user, isAuthenticated, logout } = useAuthContext();
   const { isFavorite } = useFavoritesContext();
   const { getUpcomingEvents } = useEventsContext();
   const [searchQuery, setSearchQuery] = useState("");
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'events'>('all');
   const [showDropdown, setShowDropdown] = useState(false);
   const [dropdownTimeout, setDropdownTimeout] = useState<number | null>(null);

   const restaurants: Array<Restaurant> = [
      {
         id: 1, name: "Bistro Šalša", cuisine: "Mediteranska", location: "Centar", rating: 4.5, priceLevel: 3, imageUrl: "https://example.com/images/bistro_salsa.jpg"
      },
      { id: 2, name: "Pizzeria Napoli", cuisine: "Italijanska", location: "Trešnjevka", rating: 4.2, priceLevel: 2, imageUrl: "https://example.com/images/pizzeria_napoli.jpg" },
      { id: 3, name: "Sushi World", cuisine: "Japanska", location: "Maksimir", rating: 4.8, priceLevel: 4, imageUrl: "https://example.com/images/sushi_world.jpg" },
      { id: 4, name: "Grill House", cuisine: "Roštilj", location: "Novi Zagreb", rating: 4.0, priceLevel: 3, imageUrl: "https://example.com/images/grill_house.jpg" },
      { id: 5, name: "Veggie Delight", cuisine: "Vegetarijanska", location: "Centar", rating: 4.6, priceLevel: 2, imageUrl: "https://example.com/images/veggie_delight.jpg" },
      { id: 6, name: "Curry Palace", cuisine: "Indijska", location: "Dubrava", rating: 4.3, priceLevel: 3, imageUrl: "https://example.com/images/curry_palace.jpg" },
   ];

   /* useEffect(() => {
       const loadPopularRestaurants = async () => {
          try {
             const popularRestaurants = await getPopularRestaurants();
             setRestaurants(popularRestaurants);
          } catch (err) {
             console.log(err);
             setError("Failed to load restaurants...");
          } finally {
             setLoading(false);
          }
       };
 
       loadPopularRestaurants();
    }, []);
 */

   const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      if (loading) return;
      /*
            setLoading(true);
            try {
               const searchResults = await searchRestaurants(searchQuery);
               setRestaurants(searchResults);
               setError(null);
            } catch (error) {
               setError("Error searching restaurants. Please try again.");
            } finally {
               setLoading(false);
            }
         }
      */
   }

   const handleLogout = async () => {
      await logout();
   }

   const handleMouseEnter = () => {
      if (dropdownTimeout) {
         clearTimeout(dropdownTimeout);
         setDropdownTimeout(null);
      }
      setShowDropdown(true);
   };

   const handleMouseLeave = () => {
      const timeout = window.setTimeout(() => {
         setShowDropdown(false);
      }, 2000); // 2 seconds delay
      setDropdownTimeout(timeout);
   };

   return (
      <div className="home">
         <header>
            <div className="header-things">
               <h3 className="header-title">RestoraniZEGE</h3>
               <div className="header-right">
                  {isAuthenticated ? (
                     <>
                        <button className="favourite-btn" onClick={() => setActiveFilter('favorites')}>
                           ♥
                        </button>
                        <img src={userImg} alt="User avatar" className="user-avatar" />
                        <div
                           className="user-dropdown"
                           onMouseEnter={handleMouseEnter}
                           onMouseLeave={handleMouseLeave}
                        >
                           <a className="login-button username-link" href="/profile">
                              {user?.name || user?.username}
                           </a>
                           {showDropdown && (
                              <div className="dropdown-content">
                                 <button className="logout-button" onClick={handleLogout}>
                                    Odjavi se
                                 </button>
                              </div>
                           )}
                        </div>
                     </>
                  ) : (
                     <>
                        <img src={userImg} alt="User avatar" className="user-avatar" />
                        <a className="login-button" href="/login">Prijavi se</a>
                     </>
                  )}
               </div>
            </div>
         </header>
         <main>
            <div className="search-filter">
               <form onSubmit={handleSearch} className="search-form">
                  <input type="text"
                     placeholder="Pretrazite restorane"
                     className="search-input"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-button">Search</button>
               </form>
               <a className="filters" href="/filter">Filtri</a>
            </div>
            <div className="home-txt">
               {isAuthenticated ? (
                  <>
                     <h1>Dobrodošli natrag, {user?.name?.split(' ')[0] || user?.username}!</h1>
                     <p className="bottom-txt">Pronađite svoje omiljene restorane i ne propustite nijedno novo događanje</p>
                  </>
               ) : (
                  <>
                     <h1>Otkrijte najbolje restorane Zagreba</h1>
                     <p className="bottom-txt">Autentična iskustva, moderna kuhinja i tradicija na jednom mjestu</p>
                  </>
               )}
            </div>
            {isAuthenticated ? (
               <>
                  <div className="filter-welcome">
                     <button
                        className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                     >
                        Svi restorani
                     </button>
                     <button
                        className={`filter-button ${activeFilter === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('favorites')}
                     >
                        Omiljeni
                     </button>
                     <button
                        className={`filter-button ${activeFilter === 'events' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('events')}
                     >
                        Događaji
                     </button>
                  </div>
                  <h2>
                     {activeFilter === 'all' && 'Svi restorani'}
                     {activeFilter === 'favorites' && 'Omiljeni restorani'}
                     {activeFilter === 'events' && 'Događaji'}
                  </h2>
                  <div className="restaurant-grid">
                     {restaurants
                        .filter((restaurant: Restaurant) => {
                           const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
                           if (activeFilter === 'favorites') {
                              return matchesSearch && isFavorite(restaurant.id);
                           }
                           if (activeFilter === 'events') {
                              return matchesSearch && getUpcomingEvents().some(event => event.restaurantId === restaurant.id);
                           }
                           return matchesSearch;
                        })
                        .map((restaurant: Restaurant) => (
                           <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))
                     }
                  </div>
               </>
            ) : (
               <>
                  <h2>Istaknuti restorani</h2>
                  <div className="restaurant-grid">
                     {restaurants.map((restaurant: Restaurant) =>
                        restaurant.name.toLowerCase().startsWith(searchQuery) && <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
                  </div>
               </>
            )}
         </main>
      </div>
   );
}
export default Home;