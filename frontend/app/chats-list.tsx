import React, { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { chatApi } from '@/src/api/chatApi';
import { ChatSession } from '@/src/types';
import { Screen } from '@/src/components/layout/Screen';
import { palette } from '@/src/theme/tokens';
import { useAuthStore } from '@/src/store/authStore';

export default function ChatsListScreen() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await chatApi.getChats();
        setChats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadChats();
  }, []);

  if (loading) {
    return (
      <Screen style={styles.center}>
        <Stack.Screen options={{ title: 'Mis Mensajes' }} />
        <ActivityIndicator size="large" color={palette.primary} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Mis Mensajes' }} />
      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tienes mensajes aún.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isBuyer = item.comprador_id === Number(user?.id);
            const otherPerson = isBuyer ? item.vendedor : item.comprador;
            const roleText = isBuyer ? 'Comprando' : 'Vendiendo';

            return (
              <TouchableOpacity 
                style={styles.chatCard} 
                onPress={() => router.push({ pathname: '/chat', params: { chatId: item.id } })}
              >
                <View style={styles.chatHeader}>
                  <Text style={styles.personName}>{otherPerson?.nombre || 'Usuario'}</Text>
                  <Text style={styles.roleBadge}>{roleText}</Text>
                </View>
                <View style={styles.chatDetails}>
                  <Text style={styles.cardName}>{item.anuncio?.nombre_carta}</Text>
                  <Text style={styles.cardPrice}>{item.anuncio?.precio} EUR</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  chatCard: {
    backgroundColor: palette.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted,
    backgroundColor: palette.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chatDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    color: palette.muted,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.pokemon,
  },
});
