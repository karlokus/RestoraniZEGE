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

   const getPriceLevelDisplay = (level: number) => {
      return "€".repeat(Math.min(Math.max(level, 1), 4));
   };

   return <>
      <div className="restaurant-card" onClick={handleCardClick}>
         <div className="restaurant-poster">
            <img
               src={restaurant.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="220"%3E%3Crect width="300" height="220" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%23999"%3ERestaurant%3C/text%3E%3C/svg%3E'}
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
            <span className="restaurant-rating"> {Number(restaurant.rating || 0).toFixed(1)}</span>
            <span className="restaurant-price">{getPriceLevelDisplay(restaurant.priceLevel)}</span>
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