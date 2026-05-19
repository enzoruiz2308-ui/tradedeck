import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/src/components/ui/IconButton';
import { palette, shadows } from '@/src/theme/tokens';
import { Listing } from '@/src/types';
import { formatPrice, relativeDate } from '@/src/utils/filters';

interface ListingCardProps {
  listing: Listing;
  favorite?: boolean;
  compact?: boolean;
  onPress?: () => void;
  onFavorite?: () => void;
}

export function ListingCard({ listing, favorite, compact, onPress, onFavorite }: ListingCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.card, compact && styles.compact]}>
      <Image source={{ uri: listing.images[0] ?? listing.card.image }} style={styles.image} contentFit="contain" cachePolicy="memory-disk" />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.type, listing.type === 'sell' ? styles.sell : styles.buy]}>{listing.type === 'sell' ? 'Venta' : 'Busca'}</Text>
          <Text style={styles.date}>{relativeDate(listing.createdAt)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {listing.title}
        </Text>
        <Text numberOfLines={1} style={styles.detail}>
          {listing.card.name} · {listing.condition}
        </Text>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            <Text style={styles.seller}>
              <Ionicons name="star" size={11} color={palette.warning} /> {listing.seller.username}
            </Text>
          </View>
          <IconButton name={favorite ? 'heart' : 'heart-outline'} label="Favorito" active={favorite} onPress={onFavorite} />
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
