// API Configuration

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
   // Auth
   AUTH_SIGN_IN: '/auth/sign-in',
   AUTH_REFRESH_TOKENS: '/auth/refresh-tokens',
   AUTH_GOOGLE: '/auth/google-authentication',
   AUTH_ME: '/auth/me',
   AUTH_LOGOUT: '/auth/logout',

   // Users
   USERS: '/users',
   USER_BY_ID: (id: number) => `/users/${id}`,

   // Favorites
   FAVORITES: '/favorites',
   FAVORITE_BY_ID: (id: number) => `/favorites/${id}`,

   // Events
   EVENTS: '/events',
   EVENTS_MY_FAVORITES: '/events/my-favorites',
   EVENTS_BY_RESTAURANT: (id: number) => `/events/restaurant/${id}`,
   EVENT_BY_ID: (id: number) => `/events/${id}`,

   // Notifications
   NOTIFICATIONS: '/notifications',
   NOTIFICATION_READ: (id: number) => `/notifications/${id}/read`,
   NOTIFICATIONS_READ_ALL: '/notifications/read-all',

   // Restaurants
   RESTAURANTS: '/restaurants',
   RESTAURANTS_VERIFIED: '/restaurants/verified',
   RESTAURANTS_SEARCH: '/restaurants/search',
   RESTAURANT_BY_ID: (id: number) => `/restaurants/${id}`,

   // Comments
   COMMENTS: '/comments',
   COMMENTS_BY_RESTAURANT: (restaurantId: number) => `/comments/restaurant/${restaurantId}`,
   COMMENTS_MY: '/comments/my-comments',
   COMMENT_BY_ID: (id: number) => `/comments/${id}`,
   COMMENT_HIDE: (id: number) => `/comments/${id}/hide`,
   COMMENT_SHOW: (id: number) => `/comments/${id}/show`,

   // Ratings
   RATINGS: '/ratings',
   RATINGS_BY_RESTAURANT: (restaurantId: number) => `/ratings/restaurant/${restaurantId}`,
   RATINGS_MY: '/ratings/my-ratings',
   RATING_BY_ID: (id: number) => `/ratings/${id}`,

   // Restaurant Photos
   PHOTOS: '/restaurant-photos',
   PHOTOS_UPLOAD: '/restaurant-photos/upload',
   PHOTOS_BY_RESTAURANT: (restaurantId: number) => `/restaurant-photos/restaurant/${restaurantId}`,
   PHOTO_BY_ID: (id: number) => `/restaurant-photos/${id}`,
   PHOTO_SET_PRIMARY: (id: number) => `/restaurant-photos/${id}/set-primary`,
};
