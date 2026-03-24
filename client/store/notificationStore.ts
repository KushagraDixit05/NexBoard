import { create } from 'zustand';
import api from '@/lib/api';

export interface AppNotification {
  _id:       string;
  type:      string;
  title:     string;
  message:   string;
  isRead:    boolean;
  link?:     string;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount:   number;
  fetchNotifications: () => Promise<void>;
  markAsRead:         (id: string) => Promise<void>;
  markAllRead:        () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount:   0,

  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({
        notifications: data.notifications,
        unreadCount:   data.unreadCount ?? data.notifications.filter((n: AppNotification) => !n.isRead).length,
      });
    } catch { /* silently fail */ }
  },

  markAsRead: async (id) => {
    await api.patch('/notifications/read', { ids: [id] });
    set((state) => ({
      notifications: state.notifications.map(n => n._id === id ? { ...n, isRead: true } : n),
      unreadCount:   Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await api.patch('/notifications/read-all');
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount:   0,
    }));
  },
}));
