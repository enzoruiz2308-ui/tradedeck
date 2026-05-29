import axios from 'axios';
import { CardQueryParams, PaginatedResponse, TradingCard } from '@/src/types';

// Calculamos la URL base a partir de EXPO_PUBLIC_API_URL quitando el '/api'
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const cardsApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cardsApi = {
  async getCards(params?: CardQueryParams): Promise<PaginatedResponse<TradingCard>> {
    const { data } = await cardsApiClient.get<PaginatedResponse<TradingCard>>('/cards', { params });
    return data;
  },

  async getCard(id: string): Promise<TradingCard> {
    const { data } = await cardsApiClient.get<TradingCard>(`/cards/${id}`);
    return data;
  },

  async searchCards(params: CardQueryParams): Promise<PaginatedResponse<TradingCard>> {
    const { data } = await cardsApiClient.get<PaginatedResponse<TradingCard>>('/cards/search', { params });
    return data;
  },
};
