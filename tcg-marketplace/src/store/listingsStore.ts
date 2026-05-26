import { create } from 'zustand';

import { normalizeApiError } from '@/src/api/client';
import { listingsApi } from '@/src/api/listingsApi';
import { Listing, ListingFormValues, ListingQueryParams, ListingStatus } from '@/src/types';

interface ListingsState {
  listings: Listing[];
  favorites: string[];
  filters: ListingQueryParams;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMutating: boolean;
  error: string | null;
  loadListings: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: Partial<ListingQueryParams>) => void;
  createListing: (values: ListingFormValues) => Promise<Listing>;
  updateListingStatus: (id: string, status: ListingStatus) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => void;
}

function buildParams(filters: ListingQueryParams, page: number, limit: number): ListingQueryParams {
  return {
    ...filters,
    page,
    limit,
    tcg: filters.tcg === 'all' ? undefined : filters.tcg,
    status: filters.status === 'all' ? undefined : filters.status,
    type: filters.type === 'all' ? undefined : filters.type,
    condition: filters.condition === 'all' ? undefined : filters.condition,
    query: filters.query || undefined,
  };
}

export const useListingsStore = create<ListingsState>((set, get) => ({
  listings: [],
  favorites: [],
  filters: {
    query: '',
    tcg: 'all',
    status: 'all',
    type: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  isLoading: false,
  isLoadingMore: false,
  isMutating: false,
  error: null,

  loadListings: async () => {
    set({ isLoading: true, error: null, page: 1 });
    try {
      const { filters, limit } = get();
      const response = await listingsApi.getListings(buildParams(filters, 1, limit));
      set({
        listings: response.data,
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
    const { page, totalPages, isLoadingMore, filters, limit, listings } = get();
    if (isLoadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true, error: null });
    try {
      const response = await listingsApi.getListings(buildParams(filters, nextPage, limit));
      const existingIds = new Set(listings.map((listing) => listing.id));
      set({
        listings: [...listings, ...response.data.filter((listing) => !existingIds.has(listing.id))],
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

  refresh: async () => {
    await get().loadListings();
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters }, page: 1 })),

  createListing: async (values) => {
    set({ isMutating: true, error: null });
    try {
      const listing = await listingsApi.createListing(values);
      set((state) => ({ listings: [listing, ...state.listings], isMutating: false }));
      return listing;
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  updateListingStatus: async (id, status) => {
    set({ isMutating: true, error: null });
    try {
      const listing = await listingsApi.updateListing(id, { status });
      set((state) => ({
        listings: state.listings.map((item) => (item.id === id ? listing : item)),
        isMutating: false,
      }));
      return listing;
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  deleteListing: async (id) => {
    set({ isMutating: true, error: null });
    try {
      await listingsApi.deleteListing(id);
      set((state) => ({ listings: state.listings.filter((item) => item.id !== id), isMutating: false }));
    } catch (error) {
      set({ error: normalizeApiError(error).message, isMutating: false });
      throw error;
    }
  },

  toggleFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id],
    })),
}));
