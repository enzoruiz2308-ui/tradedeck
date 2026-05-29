export type TcgSource = 'pokemon' | 'onepiece';

export type TcgGame = TcgSource;

export type ListingType = 'sell' | 'buy';

export type ListingStatus = 'active' | 'reserved' | 'sold' | 'paused' | 'expired';

export type CardCondition = 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Played' | 'Poor';

export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Secret Rare';

export type GradingCompany = 'raw' | 'PSA' | 'BGS' | 'CGC' | 'ACE' | 'other';

export interface GradingInfo {
  company: GradingCompany;
  grade?: string;
  certificateNumber?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  rating?: number;
  createdAt: string;
}

export interface TradingCard {
  id: string;
  tcg: TcgSource;
  game?: TcgSource;
  name: string;
  set: string;
  rarity: CardRarity;
  image: string;
  marketPrice?: number;
}

export interface Listing {
  id: string;
  type: ListingType;
  cardId: string;
  tcg: TcgSource;
  sellerId: string;
  description?: string;
  price: number;
  card?: TradingCard;
  seller?: User;
  condition: CardCondition;
  grading: GradingInfo;
  status: ListingStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  username: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CardQueryParams extends Partial<PaginationParams> {
  query?: string;
  tcg?: TcgSource | 'all';
  set?: string;
  rarity?: CardRarity | 'all';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'rarity' | 'set';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingQueryParams extends Partial<PaginationParams> {
  query?: string;
  tcg?: TcgSource | 'all';
  status?: ListingStatus | 'all';
  type?: ListingType | 'all';
  condition?: CardCondition | 'all';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CardFilters {
  query: string;
  tcg?: TcgSource | 'all';
  rarity?: CardRarity | 'all';
  set?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'name' | 'price' | 'rarity' | 'set';
  sortOrder: 'asc' | 'desc';
}

export interface ListingFormValues {
  type: ListingType;
  cardId: string;
  tcg: TcgSource;
  description?: string;
  price: number;
  condition: CardCondition;
  grading: GradingInfo;
  status: ListingStatus;
}

export interface CollectionItem {
  id: string;
  cardId: string;
  tcg: TcgSource;
  card?: TradingCard;
  quantity: number;
  condition: CardCondition;
  grading: GradingInfo;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CollectionItemPayload {
  cardId: string;
  tcg: TcgSource;
  quantity: number;
  condition: CardCondition;
  grading: GradingInfo;
  notes?: string;
}

export interface ChatSession {
  id: number;
  anuncio_id: number;
  comprador_id: number;
  vendedor_id: number;
  fecha_creacion: string;
  anuncio?: {
    nombre_carta: string;
    precio: number;
  };
  comprador?: {
    id: number;
    nombre: string;
  };
  vendedor?: {
    id: number;
    nombre: string;
  };
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  remitente_id: number;
  texto: string;
  fecha_envio: string;
  remitente?: {
    id: number;
    nombre: string;
  };
}
