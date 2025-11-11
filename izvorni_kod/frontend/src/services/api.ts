const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://restoranizege.onrender.com' : 'http://localhost:3000');

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

   // Check if access token is expired and refresh if needed
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


   async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
      return makeAuthenticatedRequest(`${API_BASE_URL}${url}`, options);
   },
};

