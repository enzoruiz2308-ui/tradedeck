import { router } from 'expo-router';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/src/components/cards/ListingCard';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useListingsStore } from '@/src/store/listingsStore';
import { palette } from '@/src/theme/tokens';

export function HomeScreen() {
  const { listings, favorites, filters, total, page, totalPages, isLoading, isLoadingMore, error, loadListings, loadMore, refresh, setFilters, toggleFavorite } =
    useListingsStore();

  useEffect(() => {
    void loadListings();
  }, [filters.query, filters.tcg, filters.status, filters.type, loadListings]);

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={palette.pokemonBlue} />}
      contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.title}>TradeDeck</Text>
        </View>
      </View>

      <SearchInput value={filters.query ?? ''} onChangeText={(query) => setFilters({ query })} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" active={filters.tcg === 'all'} onPress={() => setFilters({ tcg: 'all' })} />
        <Chip label="Pokemon" active={filters.tcg === 'pokemon'} onPress={() => setFilters({ tcg: 'pokemon' })} />
        <Chip label="One Piece" active={filters.tcg === 'onepiece'} onPress={() => setFilters({ tcg: 'onepiece' })} />
        <Chip label="Activos" active={filters.status === 'active'} onPress={() => setFilters({ status: filters.status === 'active' ? 'all' : 'active' })} />
      </ScrollView>

      <View style={styles.section}>
        <SectionHeader title="Anuncios recientes" action={`${total} encontrados`} />
        {isLoading && !listings.length ? <StateView title="Cargando anuncios" loading /> : null}
        {error ? <StateView title="No se han podido cargar anuncios" description={error} action="Reintentar" onAction={loadListings} /> : null}
        {!isLoading && !error && listings.length ? (
          listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              favorite={favorites.includes(listing.id)}
              onPress={() => router.push(`/listing-details?id=${listing.id}`)}
              onFavorite={() => toggleFavorite(listing.id)}
            />
          ))
        ) : null}
        {!isLoading && !error && !listings.length ? (
          <StateView title="Sin anuncios" description="Prueba otros filtros o vuelve cuando hayan creado más anuncios." />
        ) : null}
        {page < totalPages ? <Button title={isLoadingMore ? 'Cargando...' : 'Cargar más'} variant="secondary" disabled={isLoadingMore} onPress={loadMore} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  hero: {
    backgroundColor: palette.ink,
    borderRadius: 8,
    gap: 12,
    padding: 20,
  },
  kicker: {
    color: palette.pokemon,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '900',
  },
  heroCopy: {
    color: '#dbeafe',
    fontSize: 15,
    lineHeight: 22,
  },
  chips: {
    gap: 8,
  },
  section: {
    gap: 12,
  },
});
