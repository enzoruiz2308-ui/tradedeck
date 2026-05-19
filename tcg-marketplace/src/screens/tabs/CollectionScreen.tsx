import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useCardsStore } from '@/src/store/cardsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice } from '@/src/utils/filters';

export function CollectionScreen() {
  const [query, setQuery] = useState('');
  const { collection, removeFromCollection, addToCollection } = useUserStore();
  const { cards } = useCardsStore();
  const missing = cards.filter((card) => !collection.some((item) => item.id === card.id));
  const filtered = collection.filter((card) => `${card.name} ${card.set}`.toLowerCase().includes(query.toLowerCase()));
  const totalValue = collection.reduce((sum, card) => sum + (card.marketPrice ?? 0), 0);
  const completedSets = useMemo(() => {
    const sets = new Set(cards.map((card) => card.set));
    const complete = Array.from(sets).filter((set) => cards.filter((card) => card.set === set).every((card) => collection.some((item) => item.id === card.id)));
    return Math.round((complete.length / Math.max(sets.size, 1)) * 100);
  }, [cards, collection]);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Coleccion</Text>
        <Text style={styles.subtitle}>Controla valor estimado, progreso de sets y cartas pendientes.</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{collection.length}</Text>
          <Text style={styles.statLabel}>Cartas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatPrice(totalValue)}</Text>
          <Text style={styles.statLabel}>Valor</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedSets}%</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
      </View>

      <SearchInput value={query} onChangeText={setQuery} placeholder="Filtrar coleccion" />

      <SectionHeader title="Tus cartas" />
      {filtered.length ? (
        <View style={styles.grid}>
          {filtered.map((card) => (
            <View key={card.id} style={styles.tileWrap}>
              <TradingCardTile card={card} owned />
              <Button title="Eliminar" variant="danger" onPress={() => removeFromCollection(card.id)} />
            </View>
          ))}
        </View>
      ) : (
        <StateView title="Coleccion vacia" description="Anade cartas desde el catalogo o desde las sugerencias." />
      )}

      <SectionHeader title="Sugerencias para anadir" />
      <View style={styles.grid}>
        {missing.slice(0, 4).map((card) => (
          <View key={card.id} style={styles.tileWrap}>
            <TradingCardTile card={card} />
            <Button title="Anadir" variant="ghost" onPress={() => addToCollection(card)} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  statValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tileWrap: {
    gap: 8,
    width: '48%',
  },
});
