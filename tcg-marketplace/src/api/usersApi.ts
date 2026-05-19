import { apiClient, apiFallback } from '@/src/api/client';
import { demoUser, initialCollectionIds, mockCards, mockListings } from '@/src/data/mockData';
import { TradingCard, User } from '@/src/types';

export const usersApi = {
  async getUser(id: string): Promise<User> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<User>(`/users/${id}`);
        return data;
      },
      { ...demoUser, id },
    );
  },

  async updateProfile(profile: Partial<User>): Promise<User> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.put<User>('/users/profile', profile);
        return data;
      },
      { ...demoUser, ...profile },
    );
  },

  async getUserListings(userId: string) {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get(`/users/${userId}/listings`);
        return data;
      },
      mockListings.filter((listing) => listing.seller.id === userId),
    );
  },

  async getCollection(userId: string): Promise<TradingCard[]> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<TradingCard[]>(`/users/${userId}/collection`);
        return data;
      },
      mockCards.filter((card) => initialCollectionIds.includes(card.id)),
    );
  },
};
