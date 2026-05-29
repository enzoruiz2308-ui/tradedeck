import { apiClient } from '@/src/api/client';
import { CollectionItem, CollectionItemPayload, Listing, User } from '@/src/types';

export const usersApi = {
  async getUser(id: string): Promise<User> {
    const { data } = await apiClient.get<any>(`/usuarios/${id}`);
    return {
      id: String(data.id),
      username: data.nombre,
      email: data.email,
      createdAt: data.fecha_alta,
    };
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    // Optional/Mocked as not in friend's endpoints
    const { data } = await apiClient.put<User>('/users/profile', profile);
    return data;
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    // Optional/Mocked as not in friend's endpoints
    const { data } = await apiClient.get<Listing[]>(`/users/${userId}/listings`);
    return data;
  },

  async getMyCollection(): Promise<CollectionItem[]> {
    const { data } = await apiClient.get<CollectionItem[]>('/me/collection');
    return data;
  },

  async addCollectionItem(payload: CollectionItemPayload): Promise<CollectionItem> {
    const { data } = await apiClient.post<CollectionItem>('/me/collection', payload);
    return data;
  },

  async updateCollectionItem(id: string, payload: Partial<CollectionItemPayload>): Promise<CollectionItem> {
    const { data } = await apiClient.patch<CollectionItem>(`/me/collection/${id}`, payload);
    return data;
  },

  async deleteCollectionItem(id: string): Promise<void> {
    await apiClient.delete(`/me/collection/${id}`);
  },
};
