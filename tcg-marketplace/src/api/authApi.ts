import * as SecureStore from 'expo-secure-store';

import { apiClient, apiFallback } from '@/src/api/client';
import { demoUser } from '@/src/data/mockData';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/src/types';

const demoTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiFallback(
      async () => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
        return data;
      },
      { user: { ...demoUser, email: payload.email }, ...demoTokens },
    );

    await SecureStore.setItemAsync('tradedeck.accessToken', response.accessToken);
    await SecureStore.setItemAsync('tradedeck.refreshToken', response.refreshToken);
    await SecureStore.setItemAsync('tradedeck.user', JSON.stringify(response.user));

    return response;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiFallback(
      async () => {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
        return data;
      },
      {
        user: {
          ...demoUser,
          id: `user-${Date.now()}`,
          username: payload.username,
          email: payload.email,
        },
        ...demoTokens,
      },
    );

    await SecureStore.setItemAsync('tradedeck.accessToken', response.accessToken);
    await SecureStore.setItemAsync('tradedeck.refreshToken', response.refreshToken);
    await SecureStore.setItemAsync('tradedeck.user', JSON.stringify(response.user));

    return response;
  },

  async demoLogin(): Promise<AuthResponse> {
    await SecureStore.setItemAsync('tradedeck.accessToken', demoTokens.accessToken);
    await SecureStore.setItemAsync('tradedeck.refreshToken', demoTokens.refreshToken);
    await SecureStore.setItemAsync('tradedeck.user', JSON.stringify(demoUser));

    return { user: demoUser, ...demoTokens };
  },

  async me() {
    const storedUser = await SecureStore.getItemAsync('tradedeck.user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    return apiFallback(
      async () => {
        const { data } = await apiClient.get('/auth/me');
        return data;
      },
      null,
    );
  },

  async logout() {
    await SecureStore.deleteItemAsync('tradedeck.accessToken');
    await SecureStore.deleteItemAsync('tradedeck.refreshToken');
    await SecureStore.deleteItemAsync('tradedeck.user');
  },
};
