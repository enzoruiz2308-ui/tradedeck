from config import db

class ChatSession(db.Model):
    __tablename__ = "chats"

    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey("listings.id"), nullable=False)
    comprador_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    vendedor_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    fecha_creacion = db.Column(db.DateTime, server_default=db.func.now())

    listing = db.relationship("Listing", backref=db.backref("chats", cascade="all, delete-orphan"))
    comprador = db.relationship("Usuario", foreign_keys=[comprador_id], backref="chats_comprador")
    vendedor = db.relationship("Usuario", foreign_keys=[vendedor_id], backref="chats_vendedor")


class ChatMessage(db.Model):
    __tablename__ = "mensajes"

    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey("chats.id"), nullable=False)
    remitente_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    texto = db.Column(db.Text, nullable=False)
    fecha_envio = db.Column(db.DateTime, server_default=db.func.now())

    chat = db.relationship("ChatSession", backref=db.backref("mensajes", order_by=fecha_envio.asc(), cascade="all, delete-orphan"))
    remitente = db.relationship("Usuario", backref="mensajes_enviados")
