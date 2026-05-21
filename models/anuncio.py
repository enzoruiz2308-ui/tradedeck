from config import db

class Anuncio(db.Model):
    __tablename__ = "anuncios"

    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(10), nullable=False)        # "venta" o "compra"
    juego = db.Column(db.String(20), nullable=False)       # "pokemon" o "onepiece"
    nombre_carta = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(300))
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)