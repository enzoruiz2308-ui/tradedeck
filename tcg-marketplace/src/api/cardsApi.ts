import { apiClient, apiFallback } from '@/src/api/client';
import { mockCards } from '@/src/data/mockData';
import { CardFilters, TradingCard } from '@/src/types';
import { filterCards } from '@/src/utils/filters';

export const cardsApi = {
  async getCards(filters?: Partial<CardFilters>): Promise<TradingCard[]> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<TradingCard[]>('/cards', { params: filters });
        return data;
      },
      filterCards(mockCards, filters),
    );
  },

  async getCard(id: string): Promise<TradingCard | undefined> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<TradingCard>(`/cards/${id}`);
        return data;
      },
      mockCards.find((card) => card.id === id),
    );
  },

  async searchCards(query: string): Promise<TradingCard[]> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<TradingCard[]>('/cards/search', { params: { q: query } });
        return data;
      },
      filterCards(mockCards, { query }),
    );
  },
};
