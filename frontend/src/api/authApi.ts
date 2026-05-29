import { apiClient, ensureApiUrl } from '@/src/api/client';
import { demoUser } from '@/src/data/mockData';
import { sessionStorage } from '@/src/services/sessionStorage';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '@/src/types';

const demoTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token',
};

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data: response } = await apiClient.post<any>('/login', payload);

    const mappedResponse: AuthResponse = {
      accessToken: response.token,
      refreshToken: response.token, // Mocked as we only get one token
      user: {
        id: '1', // Will be updated when /perfil is called
        username: response.nombre,
        email: payload.email,
        createdAt: new Date().toISOString(),
      } as User
    };

    await sessionStorage.setItem('tradedeck.accessToken', mappedResponse.accessToken);
    await sessionStorage.setItem('tradedeck.refreshToken', mappedResponse.refreshToken);
    await sessionStorage.setItem('tradedeck.user', JSON.stringify(mappedResponse.user));

    return mappedResponse;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const registerPayload = {
      nombre: payload.username,
      email: payload.email,
      password: payload.password
    };
    
    await apiClient.post<any>('/usuarios', registerPayload);

    // Auto login after register
    return await this.login({ email: payload.email, password: payload.password });
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
    const { data } = await apiClient.get('/perfil');
    return {
      id: String(data.id),
      username: data.nombre,
      email: data.email,
      createdAt: data.fecha_alta,
    };
  },

  async logout() {
    await sessionStorage.deleteItem('tradedeck.accessToken');
    await sessionStorage.deleteItem('tradedeck.refreshToken');
    await sessionStorage.deleteItem('tradedeck.user');
  },
};
