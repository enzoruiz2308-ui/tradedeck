import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/src/components/cards/ListingCard';
import { TradingCardTile } from '@/src/components/cards/TradingCardTile';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { StateView } from '@/src/components/ui/StateView';
import { useAuthStore } from '@/src/store/authStore';
import { useListingsStore } from '@/src/store/listingsStore';
import { chatApi } from '@/src/api/chatApi';
import { palette } from '@/src/theme/tokens';
import { ListingStatus } from '@/src/types';

const ownerStatuses: ListingStatus[] = ['active', 'reserved', 'sold', 'paused', 'expired'];

export function ListingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const user = useAuthStore((state) => state.user);
  const { listings, isMutating, error, updateListingStatus, deleteListing } = useListingsStore();
  const [isContacting, setIsContacting] = useState(false);
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <Screen>
        <StateView title="Anuncio no encontrado" description="Carga el anuncio desde el feed para ver sus detalles." />
      </Screen>
    );
  }

  const isOwner = Boolean(user && listing.sellerId === user.id);

  const confirmDelete = () => {
    Alert.alert('Eliminar anuncio', 'Esta acción eliminar el anunció.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteListing(listing.id);
          router.back();
        },
      },
    ]);
  };

  const handleContact = async () => {
    if (!user) return;
    try {
      setIsContacting(true);
      const chat = await chatApi.createChat(Number(listing.id));
      router.push({ pathname: '/chat', params: { chatId: chat.id } });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'No se pudo abrir el chat');
    } finally {
      setIsContacting(false);
    }
  };

  return (
    <Screen>
      <ListingCard listing={listing} />
      {listing.card ? <TradingCardTile card={listing.card} /> : <StateView title={listing.cardId} description="Carta pendiente de resolver por backend." />}
      <View style={styles.panel}>
        <Text style={styles.title}>Detalles</Text>
        <Text style={styles.text}>{listing.description || 'Sin descripcion.'}</Text>
        <Text style={styles.text}>Vendedor: {listing.seller?.username ?? listing.sellerId}</Text>
        <Text style={styles.text}>Estado carta: {listing.condition}</Text>
        <Text style={styles.text}>Status anuncio: {listing.status}</Text>
        <Text style={styles.text}>Grading: {listing.grading.company === 'raw' ? 'Raw' : `${listing.grading.company} ${listing.grading.grade ?? ''}`}</Text>
      </View>

      {isOwner ? (
        <View style={styles.ownerPanel}>
          <SectionHeader title="Acciones de propietario" />
          <View style={styles.chips}>
            {ownerStatuses.map((status) => (
              <Chip key={status} label={status} active={listing.status === status} onPress={() => void updateListingStatus(listing.id, status)} />
            ))}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title={isMutating ? 'Aplicando...' : 'Eliminar anuncio'} variant="danger" disabled={isMutating} onPress={confirmDelete} />
        </View>
      ) : (
        <View style={styles.contactPanel}>
          <Button 
            title={isContacting ? "Abriendo chat..." : "Contactar al vendedor"} 
            disabled={isContacting || !user} 
            onPress={handleContact} 
          />
          {!user && <Text style={styles.text}>Inicia sesión para contactar</Text>}
        </View>
      )}
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
  ownerPanel: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  error: {
    color: palette.onePiece,
    fontWeight: '800',
  },
});
