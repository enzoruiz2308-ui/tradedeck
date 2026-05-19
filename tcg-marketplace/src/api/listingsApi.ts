import { apiClient, apiFallback } from '@/src/api/client';
import { mockListings } from '@/src/data/mockData';
import { Listing, ListingFormValues, TradingCard, User } from '@/src/types';

export const listingsApi = {
  async getListings(): Promise<Listing[]> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<Listing[]>('/listings');
        return data;
      },
      mockListings,
    );
  },

  async getListing(id: string): Promise<Listing | undefined> {
    return apiFallback(
      async () => {
        const { data } = await apiClient.get<Listing>(`/listings/${id}`);
        return data;
      },
      mockListings.find((listing) => listing.id === id),
    );
  },

  async createListing(values: ListingFormValues, card: TradingCard, seller: User): Promise<Listing> {
    const fallback: Listing = {
      id: `lst-${Date.now()}`,
      ...values,
      card,
      seller,
      images: [card.image],
      createdAt: new Date().toISOString(),
    };

    return apiFallback(
      async () => {
        const { data } = await apiClient.post<Listing>('/listings', values);
        return data;
      },
      fallback,
    );
  },
};
