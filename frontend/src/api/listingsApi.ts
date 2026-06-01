import { apiClient } from '@/src/api/client';
import { cardsApi } from '@/src/api/cardsApi';
import { Listing, ListingFormValues, ListingQueryParams, ListingStatus, PaginatedResponse } from '@/src/types';

export const listingsApi = {
  async getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
    const apiParams: any = {};
    if (params?.type && params.type !== 'all') apiParams.type = params.type;
    if (params?.tcg && params.tcg !== 'all') apiParams.tcg = params.tcg;
    if (params?.status && params.status !== 'all') apiParams.status = params.status;
    if (params?.query) apiParams.query = params.query;
    if (params?.page) apiParams.page = params.page;
    if (params?.limit) apiParams.limit = params.limit;

    const { data } = await apiClient.get<PaginatedResponse<Listing>>('/listings', { params: apiParams });
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
