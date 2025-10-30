import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type User = {
   id: number;
   name: string;
   email: string;
   username?: string;
}

type AuthContextType = {
   user: User | null;
   isAuthenticated: boolean;
   loading: boolean;
   checkAuth: () => Promise<void>;
   logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TEMPORARY: Set to true to mock logged in user
const MOCK_AUTH = true;

export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [loading, setLoading] = useState(true);

   const checkAuth = async () => {
      // TEMPORARY: Mock authentication for development
      if (MOCK_AUTH) {
         setTimeout(() => {
            setUser({
               id: 1,
               name: 'Marko Kovač',
               email: 'marko@example.com',
               username: 'marko'
            });
            setLoading(false);
         }, 500);
         return;
      }

      try {
         const response = await fetch('http://localhost:3000/api/auth/me', {
            credentials: 'include',
         });

         if (response.ok) {
            const userData = await response.json();
            setUser(userData);
         } else {
            setUser(null);
         }
      } catch (error) {
         console.error('Auth check failed:', error);
         setUser(null);
      } finally {
         setLoading(false);
      }
   };

   const logout = async () => {
      // TEMPORARY: Mock logout
      if (MOCK_AUTH) {
         setUser(null);
         return;
      }

      try {
         await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
         });
         setUser(null);
      } catch (error) {
         console.error('Logout failed:', error);
      }
   };

   useEffect(() => {
      checkAuth();
   }, []);

   return (
      <AuthContext.Provider value={{
         user,
         isAuthenticated: !!user,
         loading,
         checkAuth,
         logout
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