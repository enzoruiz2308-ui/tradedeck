import { apiClient } from '@/src/api/client';
import { Listing, ListingFormValues, ListingQueryParams, ListingStatus, PaginatedResponse } from '@/src/types';

export const listingsApi = {
  async getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
    const { data } = await apiClient.get<PaginatedResponse<Listing>>('/listings', { params });
    return data;
  },

  async getListing(id: string): Promise<Listing> {
    const { data } = await apiClient.get<Listing>(`/listings/${id}`);
    return data;
  },

  async createListing(values: ListingFormValues): Promise<Listing> {
    const { data } = await apiClient.post<Listing>('/listings', values);
    return data;
  },

  async updateListing(id: string, values: Partial<ListingFormValues> & { status?: ListingStatus }): Promise<Listing> {
    const { data } = await apiClient.put<Listing>(`/listings/${id}`, values);
    return data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/listings/${id}`);
  },
};
