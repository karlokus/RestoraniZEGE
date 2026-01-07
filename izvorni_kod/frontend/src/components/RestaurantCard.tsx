import { useState } from "react";
import "../css/RestaurantCard.css"
import { useAuthContext } from "../contexts/AuthContext";
import { useFavoritesContext } from "../contexts/FavoritesContext";
import RestaurantDetail from "./RestaurantDetail";

export type Restaurant = {
   id: number;
   name: string;
   cuisine: string;
   location: string;
   rating: number;
   priceLevel: number;
   imageUrl: string;
   latitude?: number;
   longitude?: number;
}

interface RestaurantCardProps {
   restaurant: Restaurant;
   onClick?: (restaurant: Restaurant) => void;
}

function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
   const { isAuthenticated } = useAuthContext();
   const { toggleFavorite, isFavorite } = useFavoritesContext();
   const [showDetail, setShowDetail] = useState(false);

   const isFav = isFavorite(restaurant.id);

   function onFavouriteClick(e: React.MouseEvent) {
      e.stopPropagation();
      toggleFavorite(restaurant.id);
   }

   function handleCardClick() {
      if (onClick) {
         onClick(restaurant);
      } else {
         setShowDetail(true);
      }
   }

   return <>
      <div className="restaurant-card" onClick={handleCardClick}>
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

      <RestaurantDetail
         restaurant={restaurant}
         isOpen={showDetail}
         onClose={() => setShowDetail(false)}
      />
   </>
}
export default RestaurantCard;