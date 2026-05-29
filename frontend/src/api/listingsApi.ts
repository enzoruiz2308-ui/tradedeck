import { apiClient } from '@/src/api/client';
import { Listing, ListingFormValues, ListingQueryParams, ListingStatus, PaginatedResponse } from '@/src/types';

export const listingsApi = {
  async getListings(params?: ListingQueryParams): Promise<PaginatedResponse<Listing>> {
    const apiParams: any = {};
    if (params?.type && params.type !== 'all') apiParams.tipo = params.type === 'sell' ? 'venta' : 'compra';
    if (params?.tcg && params.tcg !== 'all') apiParams.juego = params.tcg;

    const { data } = await apiClient.get<any[]>('/anuncios', { params: apiParams });
    
    const mappedData: Listing[] = data.map(item => ({
      id: String(item.id),
      type: item.tipo === 'venta' ? 'sell' : 'buy',
      cardId: item.nombre_carta,
      tcg: item.juego as any,
      sellerId: String(item.usuario_id),
      price: item.precio,
      description: item.descripcion,
      condition: 'Mint',
      grading: { company: 'raw' },
      status: 'active',
      createdAt: new Date().toISOString(),
    }));

    return {
      data: mappedData,
      page: 1,
      limit: 100,
      total: mappedData.length,
      totalPages: 1
    };
  },

  async getListing(id: string): Promise<Listing> {
    const { data: item } = await apiClient.get<any>(`/anuncios/${id}`);
    return {
      id: String(item.id),
      type: item.tipo === 'venta' ? 'sell' : 'buy',
      cardId: item.nombre_carta,
      tcg: item.juego as any,
      sellerId: String(item.usuario_id),
      price: item.precio,
      description: item.descripcion,
      condition: 'Mint',
      grading: { company: 'raw' },
      status: 'active',
      createdAt: new Date().toISOString(),
    };
  },

  async createListing(values: ListingFormValues): Promise<Listing> {
    const payload = {
      tipo: values.type === 'sell' ? 'venta' : 'compra',
      juego: values.tcg,
      nombre_carta: values.cardId || 'Carta Desconocida',
      precio: values.price,
      descripcion: values.description || ''
    };
    const { data } = await apiClient.post<any>('/anuncios', payload);
    return this.getListing(String(data.id));
  },

  async updateListing(id: string, values: Partial<ListingFormValues> & { status?: ListingStatus }): Promise<Listing> {
    const { data } = await apiClient.put<Listing>(`/listings/${id}`, values);
    return data;
  },

  async deleteListing(id: string): Promise<void> {
    await apiClient.delete(`/anuncios/${id}`);
  },
};
