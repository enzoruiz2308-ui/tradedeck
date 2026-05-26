import { create } from 'zustand';

import { cardsApi } from '@/src/api/cardsApi';
import { mockCards } from '@/src/data/mockData';
import { CardFilters, TradingCard } from '@/src/types';
import { filterCards } from '@/src/utils/filters';

interface CardsState {
  cards: TradingCard[];
  filters: CardFilters;
  visibleCount: number;
  isLoading: boolean;
  loadCards: () => Promise<void>;
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<CardFilters>) => void;
  loadMore: () => void;
  resetFilters: () => void;
}

const defaultFilters: CardFilters = {
  query: '',
  game: 'all',
  rarity: 'all',
  sortBy: 'name',
};

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: mockCards,
  filters: defaultFilters,
  visibleCount: 6,
  isLoading: false,

  loadCards: async () => {
    set({ isLoading: true });
    const cards = await cardsApi.getCards(get().filters);
    set({ cards, isLoading: false });
  },

  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query }, visibleCount: 6 })),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters }, visibleCount: 6 })),
  loadMore: () => set((state) => ({ visibleCount: Math.min(state.visibleCount + 4, filterCards(state.cards, state.filters).length) })),
  resetFilters: () => set({ filters: defaultFilters, visibleCount: 6 }),
}));
