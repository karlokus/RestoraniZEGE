import { useState } from "react";
import { type Event } from "../contexts/EventsContext";
import RestaurantDetail from "./RestaurantDetail";
import { type Restaurant } from "./RestaurantCard";
import "../css/EventCard.css";

interface EventCardProps {
   event: Event;
}

function EventCard({ event }: EventCardProps) {
   const [showDetail, setShowDetail] = useState(false);

   const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('hr-HR', {
         day: 'numeric',
         month: 'long',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      }).format(date);
   };

   const getDaysUntil = (dateString: string) => {
      const eventDate = new Date(dateString);
      const now = new Date();
      const diff = eventDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return "Danas";
      if (days === 1) return "Sutra";
      if (days < 7) return `Za ${days} dana`;
      return null;
   };

   const daysLabel = getDaysUntil(event.eventDate);

   const handleCardClick = () => {
      if (event.restaurantId) {
         setShowDetail(true);
      }
   };

   const restaurantForDetail: Restaurant | null = event.restaurantId ? {
      id: event.restaurantId,
      name: event.restaurantName || 'Restoran',
      cuisine: '',
      location: '',
      rating: 0,
      priceLevel: 1,
      imageUrl: ''
   } : null;

   return (
      <>
         <div 
            className="event-card" 
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
         >
         {event.imageUrl && (
            <div className="event-image">
               <img src={event.imageUrl} alt={event.title} />
               {daysLabel && (
                  <div className="event-badge">{daysLabel}</div>
               )}
            </div>
         )}
         <div className="event-content">
            <h3 className="event-title">{event.title}</h3>
            <div className="event-info">
               {event.restaurantName && (
                  <p className="event-restaurant">
                     <span className="restaurant-icon">🍽️</span>
                     <span>{event.restaurantName}</span>
                  </p>
               )}
               <p className="event-date">
                  <span className="date-icon">📅</span>
                  <span>{formatDate(event.eventDate)}</span>
               </p>
            </div>
            {event.description && (
               <p className="event-description">{event.description}</p>
            )}
         </div>
      </div>

      {restaurantForDetail && (
         <RestaurantDetail
            restaurant={restaurantForDetail}
            isOpen={showDetail}
            onClose={() => setShowDetail(false)}
         />
      )}
   </>
   );
}

export default EventCard;

