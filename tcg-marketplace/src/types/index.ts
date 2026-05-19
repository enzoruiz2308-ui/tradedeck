export type TcgGame = 'pokemon' | 'onepiece';

export type ListingType = 'sell' | 'buy';

export type CardCondition = 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Played' | 'Poor';

export type CardRarity = 'Common' | 'Uncommon' | 'Rare' | 'Super Rare' | 'Secret Rare';

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
  game: TcgGame;
  name: string;
  set: string;
  rarity: CardRarity;
  image: string;
  marketPrice?: number;
}

export interface Listing {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  card: TradingCard;
  seller: User;
  condition: CardCondition;
  images: string[];
  featured?: boolean;
  createdAt: string;
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

export interface CardFilters {
  query: string;
  game?: TcgGame | 'all';
  rarity?: CardRarity | 'all';
  set?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'name' | 'priceAsc' | 'priceDesc' | 'rarity';
}

export interface ListingFormValues {
  type: ListingType;
  cardId: string;
  title: string;
  description: string;
  price: number;
  condition: CardCondition;
}
