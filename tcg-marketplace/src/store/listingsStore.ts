import { create } from 'zustand';

import { listingsApi } from '@/src/api/listingsApi';
import { mockListings } from '@/src/data/mockData';
import { Listing, ListingFormValues, TradingCard, User } from '@/src/types';

interface ListingsState {
  listings: Listing[];
  favorites: string[];
  isLoading: boolean;
  loadListings: () => Promise<void>;
  refresh: () => Promise<void>;
  createListing: (values: ListingFormValues, card: TradingCard, seller: User) => Promise<Listing>;
  toggleFavorite: (id: string) => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: mockListings,
  favorites: [],
  isLoading: false,

  loadListings: async () => {
    set({ isLoading: true });
    const listings = await listingsApi.getListings();
    set({ listings, isLoading: false });
  },

  refresh: async () => {
    set({ isLoading: true });
    const listings = await listingsApi.getListings();
    set({ listings, isLoading: false });
  },

  createListing: async (values, card, seller) => {
    const listing = await listingsApi.createListing(values, card, seller);
    set((state) => ({ listings: [listing, ...state.listings] }));
    return listing;
  },

  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id],
    })),
}));
