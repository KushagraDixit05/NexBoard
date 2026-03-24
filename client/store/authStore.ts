import { create } from 'zustand';
import api from '@/lib/api';
import type { User, LoginPayload, RegisterPayload, AuthResponse } from '@/types';

interface AuthState {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;

  login:         (payload: LoginPayload) => Promise<void>;
  register:      (payload: RegisterPayload) => Promise<void>;
  logout:        () => Promise<void>;
  fetchMe:       () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  isLoading:       true,
  isAuthenticated: false,

  login: async (payload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (payload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { data } = await api.put('/users/profile', updates);
    set({ user: data });
  },
}));
