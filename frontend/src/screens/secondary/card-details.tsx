import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice, getCardTcg } from '@/src/utils/filters';

export default function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const card = useCardsStore((state) => state.cards.find((item) => item.id === id));
  const collection = useUserStore((state) => state.collection);
  const addToCollection = useUserStore((state) => state.addToCollection);
  const isMutating = useUserStore((state) => state.isMutating);
  const owned = card ? collection.some((item) => item.cardId === card.id) : false;

  if (!card) {
    return (
      <Screen>
        <StateView title="Carta no encontrada" description="La carta solicitada no esta en el catalogo cargado." />
      </Screen>
    );
  }

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.cardContainer}>
        <Image source={{ uri: card.image }} style={styles.image} contentFit="contain" />
        {owned ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>En coleccion</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.title}>{card.name}</Text>
        <Text style={styles.text}>Set: {card.set}</Text>
        <Text style={styles.text}>Rareza: {card.rarity}</Text>
        <Text style={styles.text}>Precio mercado: {formatPrice(card.marketPrice)}</Text>
        <Text style={styles.text}>Juego: {getCardTcg(card) === 'pokemon' ? 'Pokemon TCG' : 'One Piece Card Game'}</Text>
      </View>

      <Button
        title={owned ? 'Ya esta en coleccion' : isMutating ? 'Anadiendo...' : 'Anadir a coleccion'}
        disabled={owned || isMutating}
        onPress={() =>
          addToCollection({
            cardId: card.id,
            tcg: getCardTcg(card) ?? 'pokemon',
            quantity: 1,
            condition: 'Near Mint',
            grading: { company: 'raw' },
          })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingBottom: 80,
  },
  cardContainer: {
    alignItems: 'center',
  },
  image: {
    aspectRatio: 0.72,
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    width: 280,
  },
  badge: {
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: palette.success,
    fontWeight: '800',
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
});
