import { useState, useEffect } from "react";
import RestaurantCard, { type Restaurant } from "../components/RestaurantCard"
import userImg from "../assets/user.png"
import "../css/Home.css"

function Home() {

   const [searchQuery, setSearchQuery] = useState("");
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);

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

   return (
      <div className="home">
         <header>
            <div className="header-things">
               <h3 className="header-title">RestoraniZEGE</h3>
               <div className="header-right">
                  <img src={userImg} alt="User avatar" className="user-avatar" />
                  <a className="login-button" href="/login">Prijavi se</a>
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
               <h1>Otkrijte najbolje restorane Zagreba</h1>
               <p className="bottom-txt">Autentična iskustva, moderna kuhinja i tradicija na jednom mjestu</p>
            </div>
            <h2>Istaknuti restorani</h2>
            <div className="restaurant-grid">
               {restaurants.map((restaurant: Restaurant) =>
                  restaurant.name.toLowerCase().startsWith(searchQuery) && < RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
            </div>
         </main>
      </div>
   );
}
export default Home;