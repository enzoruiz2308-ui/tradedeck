import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, shadows } from '@/src/theme/tokens';
import { TradingCard } from '@/src/types';
import { formatPrice, getCardTcg } from '@/src/utils/filters';

interface TradingCardTileProps {
  card: TradingCard;
  owned?: boolean;
  selected?: boolean;
  onPress?: () => void;
}

export function TradingCardTile({ card, owned, selected, onPress }: TradingCardTileProps) {
  const tcg = getCardTcg(card);

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, selected && styles.selected]}>
      <Image source={{ uri: card.image }} style={styles.image} contentFit="contain" transition={180} cachePolicy="memory-disk" />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.name}>
          {card.name}
        </Text>
        <Text numberOfLines={1} style={styles.set}>
          {card.set}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.badge, tcg === 'pokemon' ? styles.pokemon : styles.onePiece]}>
            {tcg === 'pokemon' ? 'Pokemon' : 'One Piece'}
          </Text>
          <Text style={styles.price}>{formatPrice(card.marketPrice)}</Text>
        </View>
        {owned ? <Text style={styles.owned}>En coleccion</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 150,
    overflow: 'hidden',
    ...shadows.card,
  },
  selected: {
    borderColor: palette.pokemonBlue,
    borderWidth: 2,
  },
  image: {
    aspectRatio: 0.72,
    backgroundColor: '#eef2f7',
    width: '100%',
  },
  meta: {
    gap: 5,
    padding: 10,
  },
  name: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  set: {
    color: palette.muted,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  pokemon: {
    backgroundColor: '#fff7bf',
    color: palette.pokemonBlue,
  },
  onePiece: {
    backgroundColor: '#ffe4e8',
    color: palette.onePiece,
  },
  price: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  owned: {
    color: palette.success,
    fontSize: 12,
    fontWeight: '800',
  },
});
