import { create } from 'zustand';

import { normalizeApiError } from '@/src/api/client';
import { usersApi } from '@/src/api/usersApi';
import { CollectionItem, CollectionItemPayload, User } from '@/src/types';

interface UserState {
  collection: CollectionItem[];
  profileDraft: Partial<User>;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  loadCollection: () => Promise<void>;
  addToCollection: (payload: CollectionItemPayload) => Promise<CollectionItem>;
  updateCollectionItem: (id: string, payload: Partial<CollectionItemPayload>) => Promise<CollectionItem>;
  removeFromCollection: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<User>;
  updateProfileDraft: (profile: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  collection: [],
  profileDraft: {},
  isLoading: false,
  isMutating: false,
  error: null,

  loadCollection: async () => {
    set({ isLoading: true, error: null });
    try {
      const collection = await usersApi.getMyCollection();
      set({ collection, isLoading: false });
    } catch (error) {
      set({ error: normalizeApiError(error).message, isLoading: false });
    }
  },

  addToCollection: async (payload) => {
    set({ isMutating: true, error: null });
    try {
      const item = await usersApi.addCollectionItem(payload);
      set((state) => ({ collection: [item, ...state.collection], isMutating: false }));
      return item;
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  updateCollectionItem: async (id, payload) => {
    set({ isMutating: true, error: null });
    try {
      const item = await usersApi.updateCollectionItem(id, payload);
      set((state) => ({
        collection: state.collection.map((collectionItem) => (collectionItem.id === id ? item : collectionItem)),
        isMutating: false,
      }));
      return item;
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  removeFromCollection: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await usersApi.deleteCollectionItem(id);
      set((state) => ({ collection: state.collection.filter((item) => item.id !== id), isMutating: false }));
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  updateProfile: async (profile) => {
    set({ isMutating: true, error: null });
    try {
      const user = await usersApi.updateProfile(profile);
      set({ profileDraft: {}, isMutating: false });
      return user;
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  updateProfileDraft: (profile) => set((state) => ({ profileDraft: { ...state.profileDraft, ...profile } })),
}));
