import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { CardRarity, TcgSource } from '@/src/types';

const games: { label: string; value: TcgSource | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pokemon', value: 'pokemon' },
  { label: 'One Piece', value: 'onepiece' },
];

const rarities: (CardRarity | 'all')[] = ['all', 'Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare'];

export function CatalogScreen() {
  const { cards, filters, page, total, totalPages, isLoading, isLoadingMore, error, loadCards, loadMore, setQuery, setFilters, resetFilters } =
    useCardsStore();
  const collection = useUserStore((state) => state.collection);

  useEffect(() => {
    void loadCards();
  }, [filters.query, filters.tcg, filters.rarity, filters.set, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, loadCards]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Catalogo</Text>
        <Text style={styles.subtitle}>Cartas normalizadas por el backend TradeDeck. El frontend no consulta APIs publicas TCG.</Text>
      </View>

      <SearchInput value={filters.query} onChangeText={setQuery} placeholder="Buscar por nombre, set o rareza" />

      <View style={styles.filterBlock}>
        <SectionHeader title="Juego" />
        <View style={styles.chipWrap}>
          {games.map((game) => (
            <Chip key={game.value} label={game.label} active={filters.tcg === game.value} onPress={() => setFilters({ tcg: game.value })} />
          ))}
        </View>
      </View>

      <View style={styles.filterBlock}>
        <SectionHeader title="Rareza" />
        <View style={styles.chipWrap}>
          {rarities.map((rarity) => (
            <Chip key={rarity} label={rarity === 'all' ? 'Todas' : rarity} active={filters.rarity === rarity} onPress={() => setFilters({ rarity })} />
          ))}
        </View>
      </View>

      <View style={styles.filterBlock}>
        <SectionHeader title="Orden" />
        <View style={styles.chipWrap}>
          <Chip label="Nombre" active={filters.sortBy === 'name'} onPress={() => setFilters({ sortBy: 'name', sortOrder: 'asc' })} />
          <Chip label="Precio +" active={filters.sortBy === 'price' && filters.sortOrder === 'asc'} onPress={() => setFilters({ sortBy: 'price', sortOrder: 'asc' })} />
          <Chip label="Precio -" active={filters.sortBy === 'price' && filters.sortOrder === 'desc'} onPress={() => setFilters({ sortBy: 'price', sortOrder: 'desc' })} />
          <Chip label="Rareza" active={filters.sortBy === 'rarity'} onPress={() => setFilters({ sortBy: 'rarity', sortOrder: 'desc' })} />
        </View>
      </View>

      <SectionHeader title="Resultados" action={`${total} cartas`} />
      {isLoading && !cards.length ? <StateView title="Cargando catalogo" loading /> : null}
      {error ? <StateView title="No se ha podido cargar el catalogo" description={error} action="Reintentar" onAction={loadCards} /> : null}
      {!isLoading && !error && cards.length ? (
        <View style={styles.grid}>
          {cards.map((card) => (
            <TradingCardTile
              key={card.id}
              card={card}
              owned={collection.some((item) => item.cardId === card.id)}
              onPress={() => router.push(`/card-details?id=${card.id}`)}
            />
          ))}
        </View>
      ) : null}
      {!isLoading && !error && !cards.length ? (
        <StateView title="No hay cartas" description="Ajusta filtros o espera a que el backend sincronice cartas." action="Limpiar filtros" onAction={resetFilters} />
      ) : null}
      {page < totalPages ? <Button title={isLoadingMore ? 'Cargando...' : 'Cargar mas'} variant="ghost" disabled={isLoadingMore} onPress={loadMore} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  filterBlock: {
    gap: 9,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
