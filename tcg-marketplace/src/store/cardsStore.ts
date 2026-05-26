import { create } from 'zustand';

import { cardsApi } from '@/src/api/cardsApi';
import { normalizeApiError } from '@/src/api/client';
import { CardFilters, CardQueryParams, TradingCard } from '@/src/types';

interface CardsState {
  cards: TradingCard[];
  filters: CardFilters;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadCards: () => Promise<void>;
  loadMore: () => Promise<void>;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<CardFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: CardFilters = {
  query: '',
  tcg: 'all',
  rarity: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

function buildParams(filters: CardFilters, page: number, limit: number): CardQueryParams {
  return {
    page,
    limit,
    query: filters.query || undefined,
    tcg: filters.tcg === 'all' ? undefined : filters.tcg,
    rarity: filters.rarity === 'all' ? undefined : filters.rarity,
    set: filters.set || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  filters: defaultFilters,
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  loadCards: async () => {
    set({ isLoading: true, error: null, page: 1 });
    try {
      const { filters, limit } = get();
      const response = await cardsApi.getCards(buildParams(filters, 1, limit));
      set({
        cards: response.data,
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (error) {
      set({ error: normalizeApiError(error).message, isLoading: false });
    }
  },

  loadMore: async () => {
    const { page, totalPages, isLoadingMore, filters, limit, cards } = get();
    if (isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true, error: null });
    try {
      const response = await cardsApi.getCards(buildParams(filters, nextPage, limit));
      const existingIds = new Set(cards.map((card) => card.id));
      set({
        cards: [...cards, ...response.data.filter((card) => !existingIds.has(card.id))],
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        isLoadingMore: false,
      });
    } catch (error) {
      set({ error: normalizeApiError(error).message, isLoadingMore: false });
    }
  },

  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query }, page: 1 })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 })),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),
}));
