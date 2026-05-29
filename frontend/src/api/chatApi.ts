import { apiClient } from '@/src/api/client';
import { ChatSession, ChatMessage } from '@/src/types';

export const chatApi = {
  async getChats(): Promise<ChatSession[]> {
    const { data } = await apiClient.get<ChatSession[]>('/chats');
    return data;
  },

  async createChat(anuncioId: number): Promise<ChatSession> {
    const { data } = await apiClient.post<ChatSession>('/chats', { anuncio_id: anuncioId });
    return data;
  },

  async getChat(chatId: number): Promise<ChatSession> {
    const { data } = await apiClient.get<ChatSession>(`/chats/${chatId}`);
    return data;
  },

  async getMessages(chatId: number): Promise<ChatMessage[]> {
    const { data } = await apiClient.get<ChatMessage[]>(`/chats/${chatId}/mensajes`);
    return data;
  },

  async sendMessage(chatId: number, texto: string): Promise<ChatMessage> {
    const { data } = await apiClient.post<ChatMessage>(`/chats/${chatId}/mensajes`, { texto });
    return data;
  },
};
