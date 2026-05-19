import { create } from 'zustand';

import { authApi } from '@/src/api/authApi';
import { LoginPayload, RegisterPayload, User } from '@/src/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  error: null,

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: Boolean(user), isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(payload);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ error: 'No se ha podido iniciar sesion.', isLoading: false });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(payload);
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ error: 'No se ha podido crear la cuenta.', isLoading: false });
    }
  },

  demoLogin: async () => {
    set({ isLoading: true, error: null });
    const response = await authApi.demoLogin();
    set({ user: response.user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateUser: (user) => set({ user }),
}));
