import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { selectAllFilteredCards, selectFilteredCards, useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { CardRarity, TcgGame } from '@/src/types';

const games: { label: string; value: TcgGame | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pokemon', value: 'pokemon' },
  { label: 'One Piece', value: 'onepiece' },
];

const rarities: (CardRarity | 'all')[] = ['all', 'Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare'];

export function CatalogScreen() {
  const cards = useCardsStore(selectFilteredCards);
  const allFiltered = useCardsStore(selectAllFilteredCards);
  const { filters, visibleCount, setQuery, setFilters, loadMore, resetFilters } = useCardsStore();
  const { collection, addToCollection } = useUserStore();
  const sets = useMemo(() => Array.from(new Set(allFiltered.map((card) => card.set))), [allFiltered]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Catalogo</Text>
        <Text style={styles.subtitle}>Explora cartas, filtra por juego y guarda tus favoritas en coleccion.</Text>
      </View>

      <SearchInput value={filters.query} onChangeText={setQuery} placeholder="Buscar por nombre, set o rareza" />

      <View style={styles.filterBlock}>
        <SectionHeader title="Juego" />
        <View style={styles.chipWrap}>
          {games.map((game) => (
            <Chip key={game.value} label={game.label} active={filters.game === game.value} onPress={() => setFilters({ game: game.value })} />
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
          <Chip label="Nombre" active={filters.sortBy === 'name'} onPress={() => setFilters({ sortBy: 'name' })} />
          <Chip label="Precio +" active={filters.sortBy === 'priceAsc'} onPress={() => setFilters({ sortBy: 'priceAsc' })} />
          <Chip label="Precio -" active={filters.sortBy === 'priceDesc'} onPress={() => setFilters({ sortBy: 'priceDesc' })} />
          <Chip label="Rareza" active={filters.sortBy === 'rarity'} onPress={() => setFilters({ sortBy: 'rarity' })} />
        </View>
      </View>

      <SectionHeader title="Resultados" action={`${allFiltered.length} cartas`} />
      {cards.length ? (
        <View style={styles.grid}>
          {cards.map((card) => (
            <TradingCardTile
              key={card.id}
              card={card}
              owned={collection.some((item) => item.id === card.id)}
              onPress={() => {
                addToCollection(card);
                router.push(`/card-details?id=${card.id}`);
              }}
            />
          ))}
        </View>
      ) : (
        <StateView title="No hay cartas" description="Ajusta filtros o borra la busqueda." action="Limpiar filtros" onAction={resetFilters} />
      )}

      {visibleCount < allFiltered.length ? <Button title="Cargar mas" variant="ghost" onPress={loadMore} /> : null}
      {sets.length ? <Text style={styles.sets}>Sets visibles: {sets.join(', ')}</Text> : null}
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
  sets: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
