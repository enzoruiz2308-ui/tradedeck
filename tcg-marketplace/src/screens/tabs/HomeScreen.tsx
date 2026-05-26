import { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ListingCard } from '@/src/components/cards/ListingCard';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useListingsStore } from '@/src/store/listingsStore';
import { palette } from '@/src/theme/tokens';
import { searchListings } from '@/src/utils/filters';

export function HomeScreen() {
  const { listings, favorites, isLoading, loadListings, refresh, toggleFavorite } = useListingsStore();
  const [query, setQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<'all' | 'pokemon' | 'onepiece'>('all');
  const filtered = useMemo(() => {
    let result = searchListings(listings, query);
    if (selectedGame !== 'all') {
      result = result.filter(
        (listing) => listing.card.game?.toLowerCase() === selectedGame
      );
    }
    return result;
  }, [listings, query, selectedGame]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  return (
    <Screen
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={palette.pokemonBlue} />}
      contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.kicker}>TCG marketplace</Text>
          <Text style={styles.title}>TradeDeck</Text>
        </View>
        <Text style={styles.heroCopy}>Compra, vende y organiza cartas Pokemon y One Piece con una experiencia rapida.</Text>
      </View>

      <SearchInput value={query} onChangeText={setQuery} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" active={selectedGame === 'all'} onPress={() => setSelectedGame('all')} />
        <Chip label="Pokemon" active={selectedGame === 'pokemon'} onPress={() => setSelectedGame('pokemon')} />
        <Chip label="One Piece" active={selectedGame === 'onepiece'} onPress={() => setSelectedGame('onepiece')} />
      </ScrollView>

      <View style={styles.section}>
        <SectionHeader title="Anuncios recientes" action={`${filtered.length} activos`} />
        {filtered.length ? (
          filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              favorite={favorites.includes(listing.id)}
              onPress={() => router.push(`/listing-details?id=${listing.id}`)}
              onFavorite={() => toggleFavorite(listing.id)}
            />
          ))
        ) : (
          <StateView title="Sin anuncios" description="Prueba con otra busqueda o publica el primer anuncio." />
        )}
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
  carousel: {
    gap: 12,
    paddingRight: 18,
  },
});
