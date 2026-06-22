import { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        showToast(notification);
      });
    }

    const timer = setTimeout(() => {
      fetchNotifications();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (socket) {
        socket.off('notification');
      }
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || isInitialized) return;
      
      const { data } = await notificationAPI.getNotifications({ limit: 50 });
      if (data?.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setIsInitialized(true);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const showToast = (notification) => {
    if (!notification) return;
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-white shadow-2xl rounded-xl p-4 max-w-sm z-[9999] animate-slide-in-right border border-gray-200';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <p class="font-bold text-gray-900 text-sm">${(notification.type || '').replace(/_/g, ' ').toUpperCase()}</p>
          <p class="text-sm text-gray-600 mt-1">${notification.message || ''}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
