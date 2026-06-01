import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/src/components/ui/IconButton';
import { palette, shadows } from '@/src/theme/tokens';
import { Listing, ListingStatus } from '@/src/types';
import { formatPrice, getCardTitle, relativeDate } from '@/src/utils/filters';

interface ListingCardProps {
  listing: Listing;
  favorite?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
}

export const statusLabels: Record<ListingStatus, string> = {
  active: 'Activa',
  reserved: 'Reservada',
  sold: 'Vendida',
  paused: 'Pausada',
  expired: 'Caducada',
};

export function ListingCard({ listing, favorite, compact, onPress, onFavorite }: ListingCardProps) {
  const cardImage = listing.card?.image;
  const sellerName = listing.seller?.username ?? 'Usuario TradeDeck';
  const grading = listing.grading.company === 'raw' ? 'Raw' : `${listing.grading.company} ${listing.grading.grade ?? ''}`.trim();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, compact && styles.compact]}>
      {cardImage ? <Image source={{ uri: cardImage }} style={styles.image} contentFit="contain" cachePolicy="memory-disk" /> : <View style={styles.image} />}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.type, listing.type === 'sell' ? styles.sell : styles.buy]}>{listing.type === 'sell' ? 'Venta' : 'Busca'}</Text>
          <Text style={styles.date}>{relativeDate(listing.createdAt)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {getCardTitle(listing.card)}
        </Text>
        <Text numberOfLines={1} style={styles.detail}>
          {listing.condition} · {grading}
        </Text>
        <Text style={[styles.status, styles[listing.status]]}>{statusLabels[listing.status]}</Text>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            <Text style={styles.seller}>
              <Ionicons name="star" size={11} color={palette.warning} /> {sellerName}
            </Text>
          </View>
          {onFavorite ? <IconButton name={favorite ? 'heart' : 'heart-outline'} label="Favorito" active={favorite} onPress={onFavorite} /> : null}
        </View>
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
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    ...shadows.card,
  },
  compact: {
    width: 300,
  },
  image: {
    backgroundColor: '#eef2f7',
    borderRadius: 8,
    height: 132,
    width: 94,
  },
  body: {
    flex: 1,
    gap: 7,
    justifyContent: 'space-between',
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  type: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sell: {
    backgroundColor: '#dcfce7',
    color: palette.success,
  },
  buy: {
    backgroundColor: '#ffe4e8',
    color: palette.onePiece,
  },
  date: {
    color: palette.muted,
    fontSize: 12,
  },
  title: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  detail: {
    color: palette.muted,
    fontSize: 13,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  active: {
    backgroundColor: '#dcfce7',
    color: palette.success,
  },
  reserved: {
    backgroundColor: '#fef3c7',
    color: palette.warning,
  },
  sold: {
    backgroundColor: '#e2e8f0',
    color: palette.muted,
  },
  paused: {
    backgroundColor: '#dbeafe',
    color: palette.pokemonBlue,
  },
  expired: {
    backgroundColor: '#ffe4e8',
    color: palette.onePiece,
  },
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  seller: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 3,
  },
});
