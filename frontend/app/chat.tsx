import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, TextInput, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { chatApi } from '@/src/api/chatApi';
import { ChatSession, ChatMessage } from '@/src/types';
import { useAuthStore } from '@/src/store/authStore';
import { Button } from '@/src/components/ui/Button';
import { palette } from '@/src/theme/tokens';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const user = useAuthStore((state) => state.user);
  
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const loadData = async () => {
    try {
      const chatData = await chatApi.getChat(Number(chatId));
      setChat(chatData);
      const msgs = await chatApi.getMessages(Number(chatId));
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      setLoading(true);
      setChat(null);
      setMessages([]);
      loadData();
    }
  }, [chatId, user?.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    try {
      setSending(true);
      const msg = await chatApi.sendMessage(Number(chatId), newMessage.trim());
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chat no encontrado</Text>
      </View>
    );
  }

  const otherPerson = chat.comprador_id === Number(user?.id) ? chat.vendedor : chat.comprador;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: `Chat con ${otherPerson?.nombre || 'Usuario'}` }} />
      
      <View style={styles.headerInfo}>
        <Text style={styles.cardInfo}>Carta: {chat.anuncio?.nombre_carta}</Text>
        <Text style={styles.priceInfo}>{chat.anuncio?.precio} EUR</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMe = item.remitente_id === Number(user?.id);
          return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
              <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>{item.texto}</Text>
              <Text style={styles.timeText}>
                {new Date(item.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          multiline
        />
        <Button 
          title="Enviar" 
          onPress={handleSend} 
          disabled={!newMessage.trim() || sending} 
          style={styles.sendBtn} 
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: palette.onePiece,
    fontSize: 16,
    fontWeight: '600',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  cardInfo: {
    fontWeight: '700',
    color: palette.ink,
  },
  priceInfo: {
    fontWeight: '800',
    color: palette.pokemon,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: palette.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: palette.white,
  },
  theirMessageText: {
    color: palette.ink,
  },
  timeText: {
    fontSize: 11,
    color: palette.muted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
    color: palette.ink,
  },
  sendBtn: {
    marginBottom: 4,
  },
});
