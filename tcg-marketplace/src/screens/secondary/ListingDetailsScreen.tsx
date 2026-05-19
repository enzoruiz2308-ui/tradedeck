import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/src/components/cards/ListingCard';
import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useListingsStore } from '@/src/store/listingsStore';
import { palette } from '@/src/theme/tokens';

export function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, favorites, toggleFavorite } = useListingsStore();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <Screen>
        <StateView title="Anuncio no encontrado" description="Puede que el anuncio ya no este disponible." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ListingCard listing={listing} favorite={favorites.includes(listing.id)} onFavorite={() => toggleFavorite(listing.id)} />
      <TradingCardTile card={listing.card} />
      <View style={styles.panel}>
        <Text style={styles.title}>Descripcion</Text>
        <Text style={styles.text}>{listing.description}</Text>
        <Text style={styles.text}>Vendedor: {listing.seller.username}</Text>
        <Text style={styles.text}>Estado: {listing.condition}</Text>
      </View>
      <Button title="Abrir chat preparado" variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  title: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  text: {
    color: palette.muted,
    lineHeight: 20,
  },
});
