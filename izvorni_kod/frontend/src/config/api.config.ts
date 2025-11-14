// API Configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
   // Auth
   AUTH_ME: '/auth/me',
   AUTH_LOGOUT: '/auth/logout',

   // Favorites
   FAVORITES: '/favorites',
   FAVORITE_BY_ID: (id: number) => `/favorites/${id}`,

   // Events
   EVENTS: '/events',
   EVENTS_BY_RESTAURANT: (id: number) => `/events/restaurant/${id}`,

   // Notifications
   NOTIFICATIONS: '/notifications',
   NOTIFICATION_READ: (id: number) => `/notifications/${id}/read`,
   NOTIFICATIONS_READ_ALL: '/notifications/read-all',

   // Restaurants
   RESTAURANTS: '/restaurants',
   RESTAURANT_BY_ID: (id: number) => `/restaurants/${id}`,
};
