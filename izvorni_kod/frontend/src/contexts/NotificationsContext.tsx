import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

export type Notification = {
   id: number;
   title: string;
   message: string;
   timestamp: string;
   read: boolean;
   type: 'event' | 'promotion' | 'favorite' | 'general';
}

type NotificationsContextType = {
   notifications: Notification[];
   unreadCount: number;
   loading: boolean;
   markAsRead: (notificationId: number) => Promise<void>;
   markAllAsRead: () => Promise<void>;
   fetchNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// TEMPORARY: Mock notifications for development
const MOCK_NOTIFICATIONS = true;

export function NotificationsProvider({ children }: { children: ReactNode }) {
   const { isAuthenticated } = useAuthContext();
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (isAuthenticated) {
         fetchNotifications();
      } else {
         setNotifications([]);
         setLoading(false);
      }
   }, [isAuthenticated]);

   const fetchNotifications = async () => {
      setLoading(true);

      // TEMPORARY: Mock notifications for development
      if (MOCK_NOTIFICATIONS) {
         setTimeout(() => {
            setNotifications([
               {
                  id: 1,
                  title: 'Nova promocija',
                  message: 'Bistro Šalša ima 20% popust ovaj vikend!',
                  timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                  read: false,
                  type: 'promotion'
               },
               {
                  id: 2,
                  title: 'Novi događaj',
                  message: 'Pizzeria Napoli organizira talijanski večer sutra u 19h',
                  timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                  read: false,
                  type: 'event'
               },
               {
                  id: 3,
                  title: 'Omiljeni restoran',
                  message: 'Sushi World je ažurirao svoj jelovnik!',
                  timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                  read: true,
                  type: 'favorite'
               }
            ]);
            setLoading(false);
         }, 300);
         return;
      }

      try {
         const response = await fetch('http://localhost:3000/api/notifications', {
            credentials: 'include',
         });

         if (response.ok) {
            const data = await response.json();
            setNotifications(data);
         }
      } catch (error) {
         console.error('Failed to fetch notifications:', error);
      } finally {
         setLoading(false);
      }
   };

   const markAsRead = async (notificationId: number) => {
      // TEMPORARY: Mock marking as read
      if (MOCK_NOTIFICATIONS) {
         setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
         );
         return;
      }

      try {
         await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            credentials: 'include',
         });

         setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
         );
      } catch (error) {
         console.error('Failed to mark notification as read:', error);
      }
   };

   const markAllAsRead = async () => {
      // TEMPORARY: Mock marking all as read
      if (MOCK_NOTIFICATIONS) {
         setNotifications(prev => prev.map(n => ({ ...n, read: true })));
         return;
      }

      try {
         await fetch('http://localhost:3000/api/notifications/read-all', {
            method: 'PATCH',
            credentials: 'include',
         });

         setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (error) {
         console.error('Failed to mark all notifications as read:', error);
      }
   };

   const unreadCount = notifications.filter(n => !n.read).length;

   return (
      <NotificationsContext.Provider value={{
         notifications,
         unreadCount,
         loading,
         markAsRead,
         markAllAsRead,
         fetchNotifications
      }}>
         {children}
      </NotificationsContext.Provider>
   );
}

export function useNotificationsContext() {
   const context = useContext(NotificationsContext);
   if (context === undefined) {
      throw new Error('useNotificationsContext must be used within a NotificationsProvider');
   }
   return context;
}
