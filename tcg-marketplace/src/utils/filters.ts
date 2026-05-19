import { CardFilters, Listing, TradingCard } from '@/src/types';

const rarityRank = ['Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare'];

export function formatPrice(value?: number) {
  return `${(value ?? 0).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EUR`;
}

export function relativeDate(date: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} dias`;
}

export function filterCards(cards: TradingCard[], filters?: Partial<CardFilters>) {
  const query = filters?.query?.trim().toLowerCase() ?? '';

  const filtered = cards.filter((card) => {
    const matchesQuery =
      !query ||
      card.name.toLowerCase().includes(query) ||
      card.set.toLowerCase().includes(query) ||
      card.rarity.toLowerCase().includes(query);
    const matchesGame = !filters?.game || filters.game === 'all' || card.game === filters.game;
    const matchesRarity = !filters?.rarity || filters.rarity === 'all' || card.rarity === filters.rarity;
    const matchesSet = !filters?.set || card.set === filters.set;
    const matchesMin = !filters?.minPrice || (card.marketPrice ?? 0) >= filters.minPrice;
    const matchesMax = !filters?.maxPrice || (card.marketPrice ?? 0) <= filters.maxPrice;

    return matchesQuery && matchesGame && matchesRarity && matchesSet && matchesMin && matchesMax;
  });

  switch (filters?.sortBy) {
    case 'priceAsc':
      return filtered.sort((a, b) => (a.marketPrice ?? 0) - (b.marketPrice ?? 0));
    case 'priceDesc':
      return filtered.sort((a, b) => (b.marketPrice ?? 0) - (a.marketPrice ?? 0));
    case 'rarity':
      return filtered.sort((a, b) => rarityRank.indexOf(b.rarity) - rarityRank.indexOf(a.rarity));
    case 'name':
    default:
      return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export function searchListings(listings: Listing[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return listings;

  return listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(normalized) ||
      listing.card.name.toLowerCase().includes(normalized) ||
      listing.card.set.toLowerCase().includes(normalized) ||
      listing.seller.username.toLowerCase().includes(normalized),
  );
}
