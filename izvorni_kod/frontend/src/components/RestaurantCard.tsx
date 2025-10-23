import "../css/RestaurantCard.css"

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
   function onFavouriteClick() {
      alert("clicked");
   }

   return <div className="restaurant-card">
      <div className="restaurant-poster">
         <img src={restaurant.imageUrl} alt={restaurant.name} />
         <div className="restaurant-overlay">
            <button className="favourite-btn" onClick={onFavouriteClick}>
               ♥
            </button>
         </div>
      </div>
      <div className="restaurant-info">
         <h3 className="restaurant-name">{restaurant.name}</h3>
         <p className="restaurant-cuisine">{restaurant.cuisine}</p>
         <p className="restaurant-location">📍{restaurant.location}</p>
      </div>
      <div className="rate-price">
         <span className="restaurant-rating">★ {restaurant.rating}</span>
         <span className="restaurant-price">	€ {restaurant.priceLevel}</span>
      </div>
   </div>
}
export default RestaurantCard;