import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, getStoredTokens, storeTokens, clearTokens, type RegisterData, type SignInData, type GoogleAuthData } from '../services/api';

type User = {
   id: number;
   firstName: string;
   lastName: string;
   email: string;
   role: string;
   name?: string;
}

type AuthContextType = {
   user: User | null;
   isAuthenticated: boolean;
   loading: boolean;
   login: (data: SignInData) => Promise<User | null>;
   register: (data: RegisterData) => Promise<void>;
   googleAuth: (data: GoogleAuthData) => Promise<User | null>;
   logout: () => Promise<void>;
   refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   const decodeToken = (token: string): any => {
      try {
         const base64Url = token.split('.')[1];
         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
         const jsonPayload = decodeURIComponent(
            atob(base64)
               .split('')
               .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
               .join('')
         );
         return JSON.parse(jsonPayload);
      } catch (error) {
         console.error('Failed to decode token:', error);
         return null;
      }
   };

   const loadUserFromToken = async () => {
      const { accessToken } = getStoredTokens();
      if (accessToken) {
         const decoded = decodeToken(accessToken);
         if (decoded && decoded.sub) {
            // Try to fetch full user data from backend
            try {
               const userData = await api.getUserById(decoded.sub);
               setUser({
                  id: userData.id,
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  email: userData.email,
                  role: userData.role,
                  name: userData.firstName && userData.lastName
                     ? `${userData.firstName} ${userData.lastName}`
                     : userData.email || '',
               });
            } catch (error) {
               console.warn('Failed to fetch user data, using token data:', error);
               setUser({
                  id: decoded.sub,
                  firstName: decoded.firstName || '',
                  lastName: decoded.lastName || '',
                  email: decoded.email || '',
                  role: decoded.role || 'user',
                  name: decoded.firstName && decoded.lastName
                     ? `${decoded.firstName} ${decoded.lastName}`
                     : decoded.email || '',
               });
            }
         }
      }
   };


   const refreshAccessToken = async (): Promise<boolean> => {
      const { refreshToken } = getStoredTokens();
      if (!refreshToken) {
         return false;
      }

      try {
         const response = await api.refreshTokens({ refreshToken });
         storeTokens(response.accessToken, response.refreshToken);
         await loadUserFromToken();
         return true;
      } catch (error) {
         console.error('Token refresh failed:', error);
         clearTokens();
         setUser(null);
         return false;
      }
   };


   const login = async (data: SignInData): Promise<User | null> => {
      try {
         const response = await api.signIn(data);
         storeTokens(response.accessToken, response.refreshToken);

         const decoded = decodeToken(response.accessToken);
         if (decoded && decoded.sub) {
            // Fetch full user data from backend
            try {
               const userData = await api.getUserById(decoded.sub);
               const userObj: User = {
                  id: userData.id,
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  email: userData.email,
                  role: userData.role,
                  name: userData.firstName && userData.lastName
                     ? `${userData.firstName} ${userData.lastName}`
                     : userData.email || '',
               };
               setUser(userObj);
               return userObj;
            } catch (userError) {
               // If fetching user fails, fall back to token data
               console.warn('Failed to fetch user data, using token data:', userError);
               await loadUserFromToken();
               return user;
            }
         } else {
            await loadUserFromToken();
            return user;
         }
      } catch (error: any) {
         throw new Error(error.message || 'Login failed');
      }
   };

   const register = async (data: RegisterData): Promise<void> => {
      try {
         const userData = await api.register(data);

         const authResponse = await api.signIn({
            email: data.email,
            password: data.password,
         });

         storeTokens(authResponse.accessToken, authResponse.refreshToken);

         setUser({
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            role: userData.role,
            name: `${userData.firstName} ${userData.lastName}`,
         });
      } catch (error: any) {
         throw new Error(error.message || 'Registration failed');
      }
   };

   const googleAuth = async (data: GoogleAuthData): Promise<User | null> => {
      try {
         const response = await api.googleAuth(data);
         storeTokens(response.accessToken, response.refreshToken);

         // Decode token to get user ID
         const decoded = decodeToken(response.accessToken);
         if (decoded && decoded.sub) {
            // Fetch full user data from backend
            try {
               const userData = await api.getUserById(decoded.sub);
               const userObj: User = {
                  id: userData.id,
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  email: userData.email,
                  role: userData.role,
                  name: userData.firstName && userData.lastName
                     ? `${userData.firstName} ${userData.lastName}`
                     : userData.email || '',
               };
               setUser(userObj);
               return userObj;
            } catch (userError) {
               // If fetching user fails, fall back to token data
               console.warn('Failed to fetch user data, using token data:', userError);
               await loadUserFromToken();
               return user;
            }
         } else {
            await loadUserFromToken();
            return user;
         }
      } catch (error: any) {
         throw new Error(error.message || 'Google authentication failed');
      }
   };


   const logout = async (): Promise<void> => {
      clearTokens();
      setUser(null);
   };

   useEffect(() => {
      const initAuth = async () => {
         await loadUserFromToken();
         setLoading(false);
      };
      initAuth();
   }, []);

   return (
      <AuthContext.Provider value={{
         user,
         isAuthenticated: !!user,
         loading,
         login,
         register,
         googleAuth,
         logout,
         refreshAccessToken,
      }}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuthContext() {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuthContext must be used within an AuthProvider');
   }
   return context;
}