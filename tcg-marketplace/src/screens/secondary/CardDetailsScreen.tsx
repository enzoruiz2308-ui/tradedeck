import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice } from '@/src/utils/filters';

export function CardDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const card = useCardsStore((state) => state.cards.find((item) => item.id === id));
  const { collection, addToCollection } = useUserStore();
  const owned = card ? collection.some((item) => item.id === card.id) : false;

  if (!card) {
    return (
      <Screen>
        <StateView title="Carta no encontrada" description="La carta solicitada no esta en el catalogo local." />
      </Screen>
    );
  }

  return (
    <Screen>
      <TradingCardTile card={card} owned={owned} />
      <View style={styles.panel}>
        <Text style={styles.title}>{card.name}</Text>
        <Text style={styles.text}>Set: {card.set}</Text>
        <Text style={styles.text}>Rareza: {card.rarity}</Text>
        <Text style={styles.text}>Precio mercado: {formatPrice(card.marketPrice)}</Text>
        <Text style={styles.text}>Juego: {card.game === 'pokemon' ? 'Pokemon TCG' : 'One Piece Card Game'}</Text>
      </View>
      <Button title={owned ? 'Ya esta en coleccion' : 'Anadir a coleccion'} disabled={owned} onPress={() => addToCollection(card)} />
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
    fontSize: 24,
    fontWeight: '900',
  },
  text: {
    color: palette.muted,
    fontSize: 15,
  },
});
