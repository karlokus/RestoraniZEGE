import { API_BASE_URL, API_ENDPOINTS } from '../config/api.config';

export interface RegisterData {
   firstName: string;
   lastName: string;
   email: string;
   password: string;
   role: string;
}

export interface SignInData {
   email: string;
   password: string;
}

export interface AuthResponse {
   accessToken: string;
   refreshToken: string;
}

export interface RefreshTokenData {
   refreshToken: string;
}

export interface GoogleAuthData {
   token: string;
}

export interface User {
   id: number;
   firstName: string;
   lastName: string;
   email: string;
   role: string;
}

// Restaurant interfaces
export interface Restaurant {
   id: number;
   name: string;
   description?: string;
   cuisineType?: string;
   adress?: string;
   city?: string;
   latitude?: number;
   longitude?: number;
   phone?: string;
   email?: string;
   website?: string;
   workingHours?: string;
   verified: boolean;
   averageRating: number;
   totalRatings: number;
   createdAt?: string;
   updatedAt?: string;
   userId?: number;
   user?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
   };
}

export interface SearchRestaurantsParams {
   search?: string;
   cuisineType?: string;
   city?: string;
   minRating?: number;
   verifiedOnly?: boolean;
   page?: number;
   limit?: number;
   sortBy?: string;
   order?: 'ASC' | 'DESC';
}

export interface SearchRestaurantsResponse {
   data: Restaurant[];
   meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
}

// Comment interfaces
export interface Comment {
   id: number;
   content: string;
   userId: number;
   restaurantId: number;
   isVisible: boolean;
   createdAt: string;
   user?: {
      id: number;
      firstName: string;
      lastName: string;
   };
}

export interface CreateCommentData {
   restaurantId: number;
   content: string;
}

// Rating interfaces
export interface Rating {
   id: number;
   rating: number;
   comment?: string;
   userId: number;
   restaurantId: number;
   createdAt: string;
   user?: {
      id: number;
      firstName: string;
      lastName: string;
   };
}

export interface CreateRatingData {
   restaurantId: number;
   rating: number;
   comment?: string;
}

// Photo interfaces
export interface RestaurantPhoto {
   id: number;
   photoUrl: string;
   isPrimary: boolean;
   uploadedAt: string;
}

// Event interfaces
export interface Event {
   id: string;
   title: string;
   description: string;
   eventDate: string;
   imageUrl?: string;
   restaurantId: number;
   restaurant?: Restaurant;
   createdAt?: string;
}

export interface CreateEventData {
   restaurantId: string;
   title: string;
   description: string;
   eventDate: string;
   imageUrl?: string;
}

export interface UpdateEventData {
   title?: string;
   description?: string;
   eventDate?: string;
   imageUrl?: string;
}

// Photo upload
export interface UploadPhotoData {
   restaurantId: number;
   file: File;
}

// Cuisine types enum matching backend
export enum CuisineType {
   ITALIAN = 'talijanska',
   CHINESE = 'kineska',
   MEXICAN = 'meksička',
   INDIAN = 'indijska',
   JAPANESE = 'japanska',
   THAI = 'tajlandska',
   MEDITERRANEAN = 'mediteranska',
   FAST_FOOD = 'brza-hrana',
   VEGETARIAN = 'vegetarijanska',
   SEAFOOD = 'morski-plodovi',
   STEAKHOUSE = 'steakhouse',
   BISTRO = 'bistro',
   CAFE = 'kafić',
   PIZZA = 'pizzeria',
   BAKERY = 'pekara',
   CROATIAN = 'hrvatska',
}

// Create restaurant interface
export interface CreateRestaurantData {
   name: string;
   description?: string;
   cuisineType?: CuisineType;
   adress?: string;
   city?: string;
   latitude?: number;
   longitude?: number;
   phone?: string;
   email?: string;
   website?: string;
   workingHours?: string;
}

// Update restaurant interface
export interface UpdateRestaurantData {
   name?: string;
   description?: string;
   cuisineType?: CuisineType;
   adress?: string;
   city?: string;
   latitude?: number;
   longitude?: number;
   phone?: string;
   email?: string;
   website?: string;
   workingHours?: string;
}


export const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
   return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
   };
};


export const storeTokens = (accessToken: string, refreshToken: string): void => {
   localStorage.setItem('accessToken', accessToken);
   localStorage.setItem('refreshToken', refreshToken);
};


export const clearTokens = (): void => {
   localStorage.removeItem('accessToken');
   localStorage.removeItem('refreshToken');
};


export const getAuthHeaders = (): HeadersInit => {
   const { accessToken } = getStoredTokens();
   return {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
   };
};


export const isTokenExpired = (token: string): boolean => {
   try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const exp = decoded.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
   } catch {
      return true;
   }
};


const makeAuthenticatedRequest = async (
   url: string,
   options: RequestInit = {}
): Promise<Response> => {
   let { accessToken, refreshToken } = getStoredTokens();

   if (accessToken && isTokenExpired(accessToken) && refreshToken) {
      try {
         const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-tokens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
         });

         if (refreshResponse.ok) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
            storeTokens(newAccessToken, newRefreshToken);
            accessToken = newAccessToken;
         } else {
            clearTokens();
            throw new Error('Token refresh failed');
         }
      } catch (error) {
         clearTokens();
         throw error;
      }
   }


   const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
   };

   return fetch(url, {
      ...options,
      headers,
   });
};


export const api = {
   // Register user
   async register(data: RegisterData): Promise<User> {
      const response = await fetch(`${API_BASE_URL}/users`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Registration failed' }));
         throw new Error(error.message || 'Registration failed');
      }

      return response.json();
   },

   // Sign in
   async signIn(data: SignInData): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Sign in failed' }));
         throw new Error(error.message || 'Sign in failed');
      }

      return response.json();
   },

   // Refresh tokens
   async refreshTokens(data: RefreshTokenData): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-tokens`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Token refresh failed' }));
         throw new Error(error.message || 'Token refresh failed');
      }

      return response.json();
   },

   // Google authentication
   async googleAuth(data: GoogleAuthData): Promise<AuthResponse> {
      const response = await fetch(`${API_BASE_URL}/auth/google-authentication`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Google authentication failed' }));
         throw new Error(error.message || 'Google authentication failed');
      }

      return response.json();
   },

   // Get user by ID
   async getUserById(userId: number): Promise<User> {
      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
         throw new Error(error.message || 'Failed to fetch user');
      }

      return response.json();
   },

   // Get all restaurants
   async getRestaurants(): Promise<any[]> {
      const response = await fetch(`${API_BASE_URL}/restaurants`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch restaurants' }));
         throw new Error(error.message || 'Failed to fetch restaurants');
      }

      return response.json();
   },

   // Get single restaurant by ID
   async getRestaurantById(id: number): Promise<Restaurant> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_BY_ID(id)}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch restaurant' }));
         throw new Error(error.message || 'Failed to fetch restaurant');
      }

      return response.json();
   },

   // Search restaurants with filters
   async searchRestaurants(params: SearchRestaurantsParams = {}): Promise<SearchRestaurantsResponse> {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.cuisineType) queryParams.append('cuisineType', params.cuisineType);
      if (params.city) queryParams.append('city', params.city);
      if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
      if (params.verifiedOnly !== undefined) queryParams.append('verifiedOnly', params.verifiedOnly.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.order) queryParams.append('order', params.order);

      const url = `${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS_SEARCH}?${queryParams.toString()}`;
      const response = await fetch(url, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to search restaurants' }));
         throw new Error(error.message || 'Failed to search restaurants');
      }

      return response.json();
   },

   // Get verified restaurants
   async getVerifiedRestaurants(): Promise<Restaurant[]> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS_VERIFIED}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch verified restaurants' }));
         throw new Error(error.message || 'Failed to fetch verified restaurants');
      }

      return response.json();
   },

   // Create restaurant (requires restaurant role)
   async createRestaurant(data: CreateRestaurantData): Promise<Restaurant> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS}`, {
         method: 'POST',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to create restaurant' }));
         throw new Error(error.message || 'Failed to create restaurant');
      }

      return response.json();
   },

   // Update restaurant (requires ownership)
   async updateRestaurant(id: number, data: UpdateRestaurantData): Promise<Restaurant> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_BY_ID(id)}`, {
         method: 'PATCH',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to update restaurant' }));
         throw new Error(error.message || 'Failed to update restaurant');
      }

      return response.json();
   },

   // Delete restaurant (requires ownership)
   async deleteRestaurant(id: number): Promise<void> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_BY_ID(id)}`, {
         method: 'DELETE',
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete restaurant' }));
         throw new Error(error.message || 'Failed to delete restaurant');
      }
   },

   // Get my restaurants (restaurants owned by current user)
   async getMyRestaurants(): Promise<Restaurant[]> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.RESTAURANTS}`, {
         method: 'GET',
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch my restaurants' }));
         throw new Error(error.message || 'Failed to fetch my restaurants');
      }

      // Backend returns all restaurants, we need to filter by owner
      // For now, return all - backend should have endpoint for owner's restaurants
      return response.json();
   },

   // Get comments by restaurant
   async getCommentsByRestaurant(restaurantId: number): Promise<Comment[]> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMMENTS_BY_RESTAURANT(restaurantId)}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch comments' }));
         throw new Error(error.message || 'Failed to fetch comments');
      }

      return response.json();
   },

   // Create comment
   async createComment(data: CreateCommentData): Promise<Comment> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.COMMENTS}`, {
         method: 'POST',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to create comment' }));
         throw new Error(error.message || 'Failed to create comment');
      }

      return response.json();
   },

   // Update comment
   async updateComment(id: number, text: string): Promise<Comment> {
      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMMENT_BY_ID(id)}`, {
         method: 'PATCH',
         headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
         body: JSON.stringify({ text }),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to update comment' }));
         throw new Error(error.message || 'Failed to update comment');
      }

      return response.json();
   },

   // Delete comment
   async deleteComment(id: number): Promise<void> {
      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.COMMENT_BY_ID(id)}`, {
         method: 'DELETE',
         headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete comment' }));
         throw new Error(error.message || 'Failed to delete comment');
      }
   },


   // Get ratings by restaurant
   async getRatingsByRestaurant(restaurantId: number): Promise<Rating[]> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RATINGS_BY_RESTAURANT(restaurantId)}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch ratings' }));
         throw new Error(error.message || 'Failed to fetch ratings');
      }

      return response.json();
   },

   // Create rating
   async createRating(data: CreateRatingData): Promise<Rating> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.RATINGS}`, {
         method: 'POST',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to create rating' }));
         throw new Error(error.message || 'Failed to create rating');
      }

      return response.json();
   },

   // Update rating
   async updateRating(id: number, value: number): Promise<Rating> {
      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RATING_BY_ID(id)}`, {
         method: 'PATCH',
         headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
         body: JSON.stringify({ value }),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to update rating' }));
         throw new Error(error.message || 'Failed to update rating');
      }

      return response.json();
   },

   // Delete rating
   async deleteRating(id: number): Promise<void> {
      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.RATING_BY_ID(id)}`, {
         method: 'DELETE',
         headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete rating' }));
         throw new Error(error.message || 'Failed to delete rating');
      }
   },


   // Get photos by restaurant
   async getPhotosByRestaurant(restaurantId: number): Promise<RestaurantPhoto[]> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PHOTOS_BY_RESTAURANT(restaurantId)}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch photos' }));
         throw new Error(error.message || 'Failed to fetch photos');
      }

      return response.json();
   },


   // Get all events
   async getEvents(): Promise<Event[]> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch events' }));
         throw new Error(error.message || 'Failed to fetch events');
      }

      return response.json();
   },

   // Get event by ID
   async getEventById(id: number): Promise<Event> {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENT_BY_ID(id)}`, {
         method: 'GET',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to fetch event' }));
         throw new Error(error.message || 'Failed to fetch event');
      }

      return response.json();
   },

   // Create event
   async createEvent(data: CreateEventData): Promise<Event> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.EVENTS}`, {
         method: 'POST',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to create event' }));
         throw new Error(error.message || 'Failed to create event');
      }

      return response.json();
   },

   // Update event
   async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/events/${id}`, {
         method: 'PATCH',
         body: JSON.stringify(data),
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to update event' }));
         throw new Error(error.message || 'Failed to update event');
      }

      return response.json();
   },

   // Delete event
   async deleteEvent(id: string): Promise<void> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/events/${id}`, {
         method: 'DELETE',
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete event' }));
         throw new Error(error.message || 'Failed to delete event');
      }
   },


   // Upload restaurant photo
   async uploadPhoto(data: UploadPhotoData): Promise<RestaurantPhoto> {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('restaurantId', data.restaurantId.toString());

      const { accessToken } = getStoredTokens();
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PHOTOS_UPLOAD}`, {
         method: 'POST',
         headers: {
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
         },
         body: formData,
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to upload photo' }));
         throw new Error(error.message || 'Failed to upload photo');
      }

      return response.json();
   },

   // Delete photo
   async deletePhoto(id: number): Promise<void> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.PHOTO_BY_ID(id)}`, {
         method: 'DELETE',
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to delete photo' }));
         throw new Error(error.message || 'Failed to delete photo');
      }
   },

   // Set primary photo
   async setPrimaryPhoto(id: number): Promise<RestaurantPhoto> {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}${API_ENDPOINTS.PHOTO_SET_PRIMARY(id)}`, {
         method: 'PATCH',
      });

      if (!response.ok) {
         const error = await response.json().catch(() => ({ message: 'Failed to set primary photo' }));
         throw new Error(error.message || 'Failed to set primary photo');
      }

      return response.json();
   },

   async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
      return makeAuthenticatedRequest(`${API_BASE_URL}${url}`, options);
   },
};

