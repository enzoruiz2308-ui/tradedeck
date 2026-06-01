import { AxiosError, create, InternalAxiosRequestConfig } from 'axios';

import { sessionStorage } from '@/src/services/sessionStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const hasApiUrl = Boolean(API_URL);

export const apiClient = create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getServerMessage(error: AxiosError) {
  const data = error.response?.data;
  if (data && typeof data === 'object') {
    const message = 'message' in data ? data.message : 'error' in data ? data.error : undefined;
    if (typeof message === 'string') {
      return message;
    }
  }

  return undefined;
}

export function ensureApiUrl() {
  if (!API_URL) {
    throw new ApiError('No se ha podido conectar con el servidor.', 0);
  }
}

export function normalizeApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    return new ApiError(
      getServerMessage(error) ?? 'No se ha podido completar la peticion con el servidor.',
      error.response?.status,
    );
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('Error inesperado al comunicar con el servidor.');
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  ensureApiUrl();
  const token = await sessionStorage.getItem('tradedeck.accessToken');
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
      const refreshToken = await sessionStorage.getItem('tradedeck.refreshToken');

      if (refreshToken && API_URL) {
        try {
          const { data } = await create({ timeout: 10000 }).post(`${API_URL}/auth/refresh`, { refreshToken });
          await sessionStorage.setItem('tradedeck.accessToken', data.accessToken);
          await sessionStorage.setItem('tradedeck.refreshToken', data.refreshToken ?? refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

          return apiClient(originalRequest);
        } catch {
          await sessionStorage.deleteItem('tradedeck.accessToken');
          await sessionStorage.deleteItem('tradedeck.refreshToken');
        }
      }
    }

    return Promise.reject(error);
  },
);
