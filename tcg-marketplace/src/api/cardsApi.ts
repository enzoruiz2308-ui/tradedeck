import { apiClient } from '@/src/api/client';
import { CardQueryParams, PaginatedResponse, TradingCard } from '@/src/types';

export const cardsApi = {
  async getCards(params?: CardQueryParams): Promise<PaginatedResponse<TradingCard>> {
    const { data } = await apiClient.get<PaginatedResponse<TradingCard>>('/cards', { params });
    return data;
  },

  async getCard(id: string): Promise<TradingCard> {
    const { data } = await apiClient.get<TradingCard>(`/cards/${id}`);
    return data;
  },

  async searchCards(params: CardQueryParams): Promise<PaginatedResponse<TradingCard>> {
    const { data } = await apiClient.get<PaginatedResponse<TradingCard>>('/cards/search', { params });
    return data;
  },
};
