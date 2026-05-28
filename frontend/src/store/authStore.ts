import { create } from 'zustand';

import { normalizeApiError } from '@/src/api/client';
import { authApi } from '@/src/api/authApi';
import { LoginPayload, RegisterPayload, User } from '@/src/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hasHydrated: false,
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: Boolean(user), isLoading: false, hasHydrated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false, hasHydrated: true, error: normalizeApiError(error).message });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(payload);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: normalizeApiError(error).message, isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(payload);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: normalizeApiError(error).message, isLoading: false });
      throw error;
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    const response = await authApi.demoLogin();
    set({ user: response.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, error: null, hasHydrated: true });
  },

  updateUser: (user) => set({ user }),
}));
