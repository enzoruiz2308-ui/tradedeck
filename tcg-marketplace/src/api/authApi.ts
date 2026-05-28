import { apiClient, ensureApiUrl } from '@/src/api/client';
import { demoUser } from '@/src/data/mockData';
import { sessionStorage } from '@/src/services/sessionStorage';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/src/types';

const demoTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data: response } = await apiClient.post<AuthResponse>('/auth/login', payload);

    await sessionStorage.setItem('tradedeck.accessToken', response.accessToken);
    await sessionStorage.setItem('tradedeck.refreshToken', response.refreshToken);
    await sessionStorage.setItem('tradedeck.user', JSON.stringify(response.user));

    return response;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data: response } = await apiClient.post<AuthResponse>('/auth/register', payload);

    await sessionStorage.setItem('tradedeck.accessToken', response.accessToken);
    await sessionStorage.setItem('tradedeck.refreshToken', response.refreshToken);
    await sessionStorage.setItem('tradedeck.user', JSON.stringify(response.user));

    return response;
  },

  async demoLogin(): Promise<AuthResponse> {
    await sessionStorage.setItem('tradedeck.accessToken', demoTokens.accessToken);
    await sessionStorage.setItem('tradedeck.refreshToken', demoTokens.refreshToken);
    await sessionStorage.setItem('tradedeck.user', JSON.stringify(demoUser));

    return { user: demoUser, ...demoTokens };
  },

  async me() {
    const storedUser = await sessionStorage.getItem('tradedeck.user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    ensureApiUrl();
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  async logout() {
    await sessionStorage.deleteItem('tradedeck.accessToken');
    await sessionStorage.deleteItem('tradedeck.refreshToken');
    await sessionStorage.deleteItem('tradedeck.user');
  },
};
