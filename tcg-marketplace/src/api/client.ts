import { AxiosError, create, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const hasApiUrl = Boolean(API_URL);

export const apiClient = create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('tradedeck.accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await SecureStore.getItemAsync('tradedeck.refreshToken');

      if (refreshToken && API_URL) {
        try {
          const { data } = await create({ timeout: 10000 }).post(`${API_URL}/auth/refresh`, { refreshToken });
          await SecureStore.setItemAsync('tradedeck.accessToken', data.accessToken);
          await SecureStore.setItemAsync('tradedeck.refreshToken', data.refreshToken ?? refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return apiClient(originalRequest);
        } catch {
          await SecureStore.deleteItemAsync('tradedeck.accessToken');
          await SecureStore.deleteItemAsync('tradedeck.refreshToken');
        }
      }
    }

    return Promise.reject(error);
  },
);

export async function apiFallback<T>(request: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasApiUrl) {
    return fallback;
  }

  try {
    return await request();
  } catch {
    return fallback;
  }
}
