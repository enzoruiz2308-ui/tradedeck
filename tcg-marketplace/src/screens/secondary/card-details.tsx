import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice } from '@/src/utils/filters';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const card = useCardsStore((state) =>
    state.cards.find((item) => item.id === id)
  );

  const collection = useUserStore((state) => state.collection);

  const addToCollection = useUserStore(
    (state) => state.addToCollection
  );

  const owned = card
    ? collection.some((item) => item.id === card.id)
    : false;

  if (!card) {
    return (
      <Screen>
        <StateView
          title="Carta no encontrada"
          description="La carta solicitada no esta en el catalogo local."
        />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.cardContainer}>
        <Image source={{ uri: card.image }} style={styles.image} />
        {owned && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>En colección</Text>
          </View>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>{card.name}</Text>
        <Text style={styles.text}>Set: {card.set}</Text>
        <Text style={styles.text}>Rareza: {card.rarity}</Text>
        <Text style={styles.text}>Precio mercado: {formatPrice(card.marketPrice)}</Text>
        <Text style={styles.text}>
          Juego: {card.game === 'pokemon' ? 'Pokemon TCG' : 'One Piece Card Game'}
        </Text>
      </View>

      <View style={styles.buttonWrap}>
        <Button
          title={owned ? 'Ya esta en coleccion' : 'Anadir a coleccion'}
          disabled={owned}
          onPress={() => addToCollection(card)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 14,
    gap: 20,
    paddingBottom: 80,
  },

  cardContainer: {
    alignItems: 'center',
  },

  image: {
    width: 280,
    height: 400,
    borderRadius: 20,
    resizeMode: 'cover',
  },

  badge: {
    marginTop: 12,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: 'white',
    fontWeight: '700',
  },

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
    fontSize: 24,
    fontWeight: '900',
  },

  text: {
    color: palette.muted,
    fontSize: 16,
  },

  buttonWrap: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    width: 160,
    backgroundColor: '#2ecc71',
  },
});