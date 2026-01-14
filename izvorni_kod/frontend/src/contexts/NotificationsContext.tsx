import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { api } from '../services/api';

export type Notification = {
   id: string;
   title: string;
   message: string;
   sentAt: string;
   read: boolean;
   type: 'event' | 'promotion' | 'favorite' | 'general';
   eventId?: string;
}

type NotificationsContextType = {
   notifications: Notification[];
   unreadCount: number;
   loading: boolean;
   markAsRead: (notificationId: string) => Promise<void>;
   markAllAsRead: () => Promise<void>;
   fetchNotifications: () => Promise<void>;
   deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

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

      try {
         const data = await api.getNotifications();
         setNotifications(data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            sentAt: n.sentAt,
            read: n.read,
            type: n.type,
            eventId: n.eventId,
         })));
      } catch (error) {
         console.error('Failed to fetch notifications:', error);
         setNotifications([]);
      } finally {
         setLoading(false);
      }
   };

   const markAsRead = async (notificationId: string) => {
      try {
         await api.markNotificationAsRead(notificationId);
         setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
         );
      } catch (error) {
         console.error('Failed to mark notification as read:', error);
      }
   };

   const markAllAsRead = async () => {
      try {
         await api.markAllNotificationsAsRead();
         setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (error) {
         console.error('Failed to mark all notifications as read:', error);
      }
   };

   const deleteNotification = async (notificationId: string) => {
      try {
         await api.deleteNotification(notificationId);
         setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } catch (error) {
         console.error('Failed to delete notification:', error);
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
         fetchNotifications,
         deleteNotification,
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
