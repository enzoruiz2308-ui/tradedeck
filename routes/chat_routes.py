from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from services.chat_service import ChatService

chat_bp = Blueprint("chat_api", __name__)
service = ChatService()

def serialize_chat(chat):
    return {
        "id": chat.id,
        "anuncio_id": chat.listing_id,
        "comprador_id": chat.comprador_id,
        "vendedor_id": chat.vendedor_id,
        "fecha_creacion": chat.fecha_creacion.isoformat() if chat.fecha_creacion else None,
        "anuncio": {
            "nombre_carta": chat.listing.card_id,
            "precio": chat.listing.price
        } if chat.listing else None,
        "comprador": {"id": chat.comprador.id, "nombre": chat.comprador.nombre} if chat.comprador else None,
        "vendedor": {"id": chat.vendedor.id, "nombre": chat.vendedor.nombre} if chat.vendedor else None
    }

def serialize_message(msg):
    return {
        "id": msg.id,
        "chat_id": msg.chat_id,
        "remitente_id": msg.remitente_id,
        "texto": msg.texto,
        "fecha_envio": msg.fecha_envio.isoformat() if msg.fecha_envio else None,
        "remitente": {"id": msg.remitente.id, "nombre": msg.remitente.nombre} if msg.remitente else None
    }

@chat_bp.route("/api/chats", methods=["GET"])
@jwt_required()
def list_chats():
    usuario_id = int(get_jwt_identity())
    chats = service.list_user_chats(usuario_id)
    return jsonify([serialize_chat(c) for c in chats]), 200

@chat_bp.route("/api/chats", methods=["POST"])
@jwt_required()
def create_chat():
    usuario_id = int(get_jwt_identity())
    data = request.get_json() or {}
    anuncio_id = data.get("anuncio_id")
    
    if not anuncio_id:
        return jsonify({"error": "anuncio_id es requerido"}), 400
        
    chat, error = service.get_or_create_chat(anuncio_id, usuario_id)
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify(serialize_chat(chat)), 201

@chat_bp.route("/api/chats/<int:chat_id>", methods=["GET"])
@jwt_required()
def get_chat(chat_id):
    usuario_id = int(get_jwt_identity())
    chat, error = service.get_chat(chat_id, usuario_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(serialize_chat(chat)), 200

@chat_bp.route("/api/chats/<int:chat_id>/mensajes", methods=["GET"])
@jwt_required()
def get_messages(chat_id):
    usuario_id = int(get_jwt_identity())
    chat, error = service.get_chat(chat_id, usuario_id)
    if error:
        return jsonify({"error": error}), 404
        
    mensajes = chat.mensajes
    return jsonify([serialize_message(m) for m in mensajes]), 200

@chat_bp.route("/api/chats/<int:chat_id>/mensajes", methods=["POST"])
@jwt_required()
def send_message(chat_id):
    usuario_id = int(get_jwt_identity())
    data = request.get_json() or {}
    texto = data.get("texto")
    
    if not texto:
        return jsonify({"error": "El texto del mensaje no puede estar vacío"}), 400
        
    mensaje, error = service.send_message(chat_id, usuario_id, texto)
    if error:
        return jsonify({"error": error}), 400
        
    return jsonify(serialize_message(mensaje)), 201
