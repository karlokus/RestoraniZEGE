import { type Event } from "../contexts/EventsContext";
import { Link } from "react-router-dom";
import "../css/EventCard.css";

interface EventCardProps {
   event: Event;
}

function EventCard({ event }: EventCardProps) {
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

   return (
      <div className="event-card">
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
            {event.restaurantName && (
               <Link 
                  to={`/restaurant/${event.restaurantId}`} 
                  className="event-restaurant-link"
                  onClick={(e) => e.stopPropagation()}
               >
                  <span className="restaurant-icon">🍽️</span>
                  {event.restaurantName}
               </Link>
            )}
            <p className="event-date">
               <span className="date-icon">📅</span>
               {formatDate(event.eventDate)}
            </p>
            {event.description && (
               <p className="event-description">{event.description}</p>
            )}
         </div>
      </div>
   );
}

export default EventCard;
