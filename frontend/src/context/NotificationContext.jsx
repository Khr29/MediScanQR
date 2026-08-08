import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getUserNotifications();
      
      // Ensure data is strictly an array before setting state
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to empty array on 404 or any network error
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        Array.isArray(prev)
          ? prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
          : []
      );
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => (Array.isArray(prev) ? prev.map((notif) => ({ ...notif, isRead: true })) : []));
    } catch (error) {
      console.error('Error marking all notifications read:', error);
    }
  };

  // Safe check prevents crash if notifications state isn't an array
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n?.isRead).length
    : 0;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};