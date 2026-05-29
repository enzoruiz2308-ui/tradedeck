from config import db
from models.chat import ChatSession, ChatMessage
from models.anuncio import Anuncio
from models.usuario import Usuario

class ChatService:
    def get_or_create_chat(self, anuncio_id, comprador_id):
        anuncio = Anuncio.query.get(anuncio_id)
        if not anuncio:
            return None, "Anuncio no encontrado"
        
        if anuncio.usuario_id == comprador_id:
            return None, "No puedes crear un chat para tu propio anuncio"
        
        chat = ChatSession.query.filter_by(
            anuncio_id=anuncio_id,
            comprador_id=comprador_id,
            vendedor_id=anuncio.usuario_id
        ).first()

        if not chat:
            chat = ChatSession(
                anuncio_id=anuncio_id,
                comprador_id=comprador_id,
                vendedor_id=anuncio.usuario_id
            )
            db.session.add(chat)
            db.session.commit()
            
        return chat, None

    def list_user_chats(self, usuario_id):
        # Chats where user is buyer OR seller
        chats = ChatSession.query.filter(
            (ChatSession.comprador_id == usuario_id) | 
            (ChatSession.vendedor_id == usuario_id)
        ).order_by(ChatSession.fecha_creacion.desc()).all()
        return chats

    def get_chat(self, chat_id, usuario_id):
        chat = ChatSession.query.get(chat_id)
        if not chat:
            return None, "Chat no encontrado"
        if chat.comprador_id != usuario_id and chat.vendedor_id != usuario_id:
            return None, "No tienes permiso para ver este chat"
        return chat, None

    def send_message(self, chat_id, remitente_id, texto):
        chat, error = self.get_chat(chat_id, remitente_id)
        if error:
            return None, error
            
        mensaje = ChatMessage(
            chat_id=chat_id,
            remitente_id=remitente_id,
            texto=texto
        )
        db.session.add(mensaje)
        db.session.commit()
        return mensaje, None
