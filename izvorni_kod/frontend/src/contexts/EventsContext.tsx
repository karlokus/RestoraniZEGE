import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

export type Event = {
   id: string;
   restaurantId: number;
   title: string;
   description: string;
   eventDate: string;
   imageUrl?: string;
   restaurantName?: string;
}

type EventsContextType = {
   events: Event[];
   loading: boolean;
   error: string | null;
   fetchEvents: () => Promise<void>;
   fetchEventsByRestaurant: (restaurantId: number) => Promise<Event[]>;
   getUpcomingEvents: () => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
   const [events, setEvents] = useState<Event[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Load all events on mount
   useEffect(() => {
      fetchEvents();
   }, []);

   const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
         const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS}`, {
            credentials: 'include',
         });

         if (response.ok) {
            const data = await response.json();
            setEvents(data);
         } else {
            setError('Failed to load events');
         }
      } catch (err) {
         console.error('Failed to fetch events:', err);
         setError('Failed to load events');
      } finally {
         setLoading(false);
      }
   };

   const fetchEventsByRestaurant = async (restaurantId: number): Promise<Event[]> => {
      try {
         const response = await fetch(`${API_BASE_URL}/events?restaurantId=${restaurantId}`, {
            credentials: 'include',
         });

         if (response.ok) {
            const data = await response.json();
            return data;
         }
         return [];
      } catch (err) {
         console.error('Failed to fetch restaurant events:', err);
         return [];
      }
   };

   const getUpcomingEvents = (): Event[] => {
      const now = new Date();
      return events.filter(event => new Date(event.eventDate) > now)
         .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
   };

   return (
      <EventsContext.Provider value={{
         events,
         loading,
         error,
         fetchEvents,
         fetchEventsByRestaurant,
         getUpcomingEvents
      }}>
         {children}
      </EventsContext.Provider>
   );
}

export function useEventsContext() {
   const context = useContext(EventsContext);
   if (context === undefined) {
      throw new Error('useEventsContext must be used within an EventsProvider');
   }
   return context;
}