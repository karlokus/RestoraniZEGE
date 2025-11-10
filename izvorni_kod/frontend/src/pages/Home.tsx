import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import { useEventsContext } from "../contexts/EventsContext";
import { useNotificationsContext } from "../contexts/NotificationsContext";
import RestaurantCard, { type Restaurant } from "../components/RestaurantCard"
import { api } from "../services/api";
import "../css/Home.css"
import chefImg from "../assets/chef.png";

function Home() {
   const { user, isAuthenticated, logout } = useAuthContext();
   const { isFavorite } = useFavoritesContext();
   const { getUpcomingEvents } = useEventsContext();
   const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsContext();
   const [searchQuery, setSearchQuery] = useState("");
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [restaurants, setRestaurants] = useState<Array<Restaurant>>([]);
   const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'events'>('all');
   const [showDropdown, setShowDropdown] = useState(false);
   const [showNotifications, setShowNotifications] = useState(false);
   const hideTimer = useRef<number | null>(null);
   const notifTimer = useRef<number | null>(null);

   // ispisuje inicijale imena i prezimena korisnika
   const inicijali = (() => {
      const full = (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "").trim();
      if (!full) return "";
      const dijelovi = full.split(/\s+/);
      const ime = dijelovi[0]?.[0] ?? "";
      const prez = dijelovi.length > 1 ? dijelovi[dijelovi.length - 1][0] : (dijelovi[0]?.[1] ?? "");
      return (ime + prez).toUpperCase();
   })();

   // Load restaurants from backend
   useEffect(() => {
      const loadRestaurants = async () => {
         try {
            setLoading(true);
            const data = await api.getRestaurants();
            // Map backend restaurant data to frontend Restaurant type
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
      };

      loadRestaurants();
   }, []);

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

   const clearHideTimer = () => {
      if (hideTimer.current) {
         window.clearTimeout(hideTimer.current);
         hideTimer.current = null;
      }
   };

   const handleMouseEnter = () => {
      clearHideTimer();
      setShowDropdown(true);
   };

   const handleMouseLeave = () => {
      clearHideTimer();
      hideTimer.current = window.setTimeout(() => setShowDropdown(false), 100);
   };

   const clearNotifTimer = () => {
      if (notifTimer.current) {
         window.clearTimeout(notifTimer.current);
         notifTimer.current = null;
      }
   };

   const handleNotifMouseEnter = () => {
      clearNotifTimer();
      setShowNotifications(true);
   };

   const handleNotifMouseLeave = () => {
      clearNotifTimer();
      notifTimer.current = window.setTimeout(() => setShowNotifications(false), 100);
   };

   const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
   };

   return (
      <div className="home">
         <header>
            <div className="header-things">
               <div className="brand-wrap">
                  <span className="header-title">RestoraniZEGE</span>
                  <span className="brand-sub">ZAGREB</span>
               </div>

               <div className="header-center">
                  <img className="header-img chef" src={chefImg} alt="Chef" />
               </div>

               <div className="header-right">
                  {isAuthenticated ? (
                     <>
                        <div
                           className="notification-wrapper"
                           onMouseEnter={handleNotifMouseEnter}
                           onMouseLeave={handleNotifMouseLeave}
                        >
                           <button className="bell-btn" onClick={() => setActiveFilter('events')}>
                              🔔
                              {unreadCount > 0 && (
                                 <span className="notification-badge">{unreadCount}</span>
                              )}
                           </button>
                           {showNotifications && (
                              <div className="notifications-dropdown">
                                 <div className="notifications-header">
                                    <h3>Obavijesti</h3>
                                    {unreadCount > 0 && (
                                       <button
                                          className="mark-all-read"
                                          onClick={markAllAsRead}
                                       >
                                          Označi sve kao pročitano
                                       </button>
                                    )}
                                 </div>
                                 <div className="notifications-list">
                                    {notifications.length === 0 ? (
                                       <div className="no-notifications">Nema novih obavijesti</div>
                                    ) : (
                                       notifications.map(notification => (
                                          <div
                                             key={notification.id}
                                             className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                             onClick={() => markAsRead(notification.id)}
                                          >
                                             <div className="notification-content">
                                                <h4>{notification.title}</h4>
                                                <p>{notification.message}</p>
                                                <span className="notification-time">
                                                   {formatTimestamp(notification.timestamp)}
                                                </span>
                                             </div>
                                             {!notification.read && (
                                                <span className="unread-dot"></span>
                                             )}
                                          </div>
                                       ))
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                        <button className="favourite-btn" onClick={() => setActiveFilter('favorites')}>
                           ♥
                        </button>
                        {/* maknuta ikona avatara za prijavljenog korisnika */}
                        <div
                           className="user-dropdown"
                           onMouseEnter={handleMouseEnter}
                           onMouseLeave={handleMouseLeave}
                        >
                           <a className="user-chip" href="/profile">
                              {inicijali && (
                                 <span className="initials-badge" aria-hidden="true">{inicijali}</span>
                              )}
                              <span className="user-name">{user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email}</span>
                           </a>
                           {showDropdown && (
                              <div
                                 className="dropdown-content"
                                 onMouseEnter={handleMouseEnter}
                                 onMouseLeave={handleMouseLeave}
                              >
                                 <button className="logout-button" onClick={handleLogout}>
                                    Odjavi se
                                 </button>
                              </div>
                           )}
                        </div>
                     </>
                  ) : (
                     <>
                        {/* za neprijavljenog prikazuj samo gumb/link za login */}
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
                     <h1>Dobrodošli natrag, {user?.firstName || user?.name?.split(' ')[0] || user?.email}!</h1>
                     <p className="bottom-txt">Pronađite svoje omiljene restorane i ne propustite nijedno novo događanje</p>
                  </>
               ) : (
                  <>
                     <h1>Otkrijte najbolje restorane Zagreba</h1>
                     <p className="bottom-txt">Autentična iskustva, moderna kuhinja i tradicija na jednom mjestu</p>
                  </>
               )}
            </div>
            {error && <div className="error-message" style={{ padding: '1rem', color: 'red', textAlign: 'center' }}>{error}</div>}
            {loading ? (
               <div style={{ padding: '2rem', textAlign: 'center' }}>Učitavanje restorana...</div>
            ) : (
               <>
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
                           {restaurants
                              .filter((restaurant: Restaurant) =>
                                 restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((restaurant: Restaurant) => (
                                 <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                              ))}
                        </div>
                     </>
                  )}
               </>
            )}
         </main>
      </div>
   );
}
export default Home;