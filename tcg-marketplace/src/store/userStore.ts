import { create } from 'zustand';

import { initialCollectionIds, mockCards } from '@/src/data/mockData';
import { TradingCard, User } from '@/src/types';

interface UserState {
  collection: TradingCard[];
  profileDraft: Partial<User>;
  addToCollection: (card: TradingCard) => void;
  removeFromCollection: (id: string) => void;
  updateProfileDraft: (profile: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  collection: mockCards.filter((card) => initialCollectionIds.includes(card.id)),
  profileDraft: {},

  addToCollection: (card) =>
    set((state) => {
      if (state.collection.some((item) => item.id === card.id)) return state;
      return { collection: [...state.collection, card] };
    }),

  removeFromCollection: (id) => set((state) => ({ collection: state.collection.filter((card) => card.id !== id) })),

  updateProfileDraft: (profile) => set((state) => ({ profileDraft: { ...state.profileDraft, ...profile } })),
}));
