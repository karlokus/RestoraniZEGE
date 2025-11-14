import "../css/RestaurantCard.css"
import { useAuthContext } from "../contexts/AuthContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";

export type Restaurant = {
   id: number;
   name: string;
   cuisine: string;
   location: string;
   rating: number;
   priceLevel: number;
   imageUrl: string;
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
   const { isAuthenticated } = useAuthContext();
   const { toggleFavorite, isFavorite } = useFavoritesContext();

   const isFav = isFavorite(restaurant.id);

   function onFavouriteClick() {
      toggleFavorite(restaurant.id);
   }

   return <div className="restaurant-card">
      <div className="restaurant-poster">
         <img
            src={restaurant.imageUrl || 'https://via.placeholder.com/300x220?text=Restaurant'}
            alt={restaurant.name}
         />
         {isAuthenticated ? (
            <div className="restaurant-overlay">
               <button
                  className={`favourite-btn ${isFav ? 'favorited' : ''}`}
                  onClick={onFavouriteClick}
               >
                  ♥
               </button>
            </div>
         ) : null}
      </div>
      <div className="restaurant-info">
         <h3 className="restaurant-name">{restaurant.name}</h3>
         <p className="restaurant-cuisine">{restaurant.cuisine}</p>
         <p className="restaurant-location">📍{restaurant.location}</p>
      </div>
      <div className="rate-price">
         <span className="restaurant-rating"> {restaurant.rating}</span>
         <span className="restaurant-price">	€ {restaurant.priceLevel}</span>
      </div>
   </div>
}
export default RestaurantCard;