import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ListingCard } from '@/src/components/cards/ListingCard';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { Button } from '@/src/components/ui/Button';
import { StateView } from '@/src/components/ui/StateView';
import { useAuthStore } from '@/src/store/authStore';
import { useListingsStore } from '@/src/store/listingsStore';
import { useUserStore } from '@/src/store/userStore';
import { palette } from '@/src/theme/tokens';
import { formatPrice } from '@/src/utils/filters';

export function ProfileScreen() {
  const { user, isAuthenticated, demoLogin, logout } = useAuthStore();
  const { listings, error: listingsError, loadListings, setFilters } = useListingsStore();
  const { collection, loadCollection } = useUserStore();
  const activeListings = user ? listings.filter((listing) => listing.sellerId === user.id) : [];
  const collectionValue = collection.reduce((sum, item) => sum + (item.card?.marketPrice ?? 0) * item.quantity, 0);

  useEffect(() => {
    if (!user) return;
    setFilters({ status: 'all' });
    void loadListings();
    void loadCollection();
  }, [loadCollection, loadListings, setFilters, user]);

  if (!isAuthenticated || !user) {
    return (
      <Screen contentContainerStyle={styles.center}>
        <StateView
          title="Inicia sesion"
          description="El perfil, tus anuncios y tu coleccion requieren una sesion autenticada."
          action="Entrar en demo"
          onAction={demoLogin}
        />
        <Link href="/(auth)/login" style={styles.link}>
          Ir a login
        </Link>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" /> : <View style={styles.avatar} />}
        <View style={styles.profileText}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>{user.bio ?? 'Sin bio todavia.'}</Text>
          <Text style={styles.rating}>Rating {user.rating?.toFixed(1) ?? 'Nuevo'} / 5</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activeListings.length}</Text>
          <Text style={styles.statLabel}>Anuncios</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{collection.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatPrice(collectionValue)}</Text>
          <Text style={styles.statLabel}>Valor</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Mis Mensajes" variant="primary" onPress={() => router.push('/chats-list')} />
        <Button title="Editar perfil" variant="ghost" onPress={() => router.push('/edit-profile')} />
        <Button title="Editar coleccion" variant="ghost" onPress={() => router.push('/edit-collection')} />
      </View>

      <SectionHeader title="Tus anuncios" />
      {listingsError ? <StateView title="No se han podido leer tus anuncios" description={listingsError} /> : null}
      {activeListings.length ? (
        activeListings.map((listing) => <ListingCard key={listing.id} listing={listing} onPress={() => router.push(`/listing-details?id=${listing.id}`)} />)
      ) : (
        <StateView title="Sin anuncios propios" description="Publica una venta o busqueda desde la pestana central." />
      )}

      <Button title="Cerrar sesion" variant="danger" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  avatar: {
    backgroundColor: '#e2e8f0',
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  bio: {
    color: palette.muted,
    lineHeight: 19,
  },
  rating: {
    color: palette.warning,
    fontWeight: '900',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    backgroundColor: palette.ink,
    borderRadius: 8,
    flex: 1,
    padding: 12,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  link: {
    color: palette.pokemonBlue,
    fontWeight: '800',
    textAlign: 'center',
  },
});
