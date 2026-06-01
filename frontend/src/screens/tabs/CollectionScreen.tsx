import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { SearchInput } from '@/src/components/forms/SearchInput';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice } from '@/src/utils/filters';

export function CollectionScreen() {
  const [query, setQuery] = useState('');
  const { collection, isLoading, isMutating, error, loadCollection, removeFromCollection } = useUserStore();

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  const filtered = collection.filter((item) => `${item.card?.name ?? item.cardId} ${item.card?.set ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  const totalCards = collection.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = collection.reduce((sum, item) => sum + (item.card?.marketPrice ?? 0) * item.quantity, 0);
  const gradedCards = useMemo(() => collection.filter((item) => item.grading.company !== 'raw').length, [collection]);

  return (
    <Screen>
      <View>
        <Text style={styles.title}>Colección</Text>
        <Text style={styles.subtitle}>Consulta tus cartas.</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalCards}</Text>
          <Text style={styles.statLabel}>Cartas</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatPrice(totalValue)}</Text>
          <Text style={styles.statLabel}>Valor</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{gradedCards}</Text>
          <Text style={styles.statLabel}>Graded</Text>
        </View>
      </View>

      <SearchInput value={query} onChangeText={setQuery} placeholder="Filtrar colección" />

      <SectionHeader title="Tus cartas" action="Editar en lote" />
      {isLoading ? <StateView title="Cargando colección" loading /> : null}
      {error ? <StateView title="No se ha podido cargar la colección" description={error} action="Reintentar" onAction={loadCollection} /> : null}
      {!isLoading && !error && filtered.length ? (
        <View style={styles.grid}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.tileWrap}>
              {item.card ? <TradingCardTile card={item.card} owned /> : <StateView title={item.cardId} description="Carta pendiente de resolver por backend." />}
              <Text style={styles.meta}>
                x{item.quantity} · {item.condition} · {item.grading.company === 'raw' ? 'Raw' : item.grading.company}
              </Text>
              <Button title="Editar" variant="ghost" onPress={() => router.push(`/edit-collection?id=${item.id}`)} />
              <Button title={isMutating ? 'Eliminando...' : 'Eliminar'} variant="danger" disabled={isMutating} onPress={() => void removeFromCollection(item.id)} />
            </View>
          ))}
        </View>
      ) : null}
      {!isLoading && !error && !filtered.length ? <StateView title="Colección vacía" description="Añade cartas desde el catálogo." /> : null}
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
  meta: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
