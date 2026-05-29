from config import db
 
class Usuario(db.Model):

    __tablename__ = "usuarios"
 
    id = db.Column(db.Integer, primary_key=True)

    login = db.Column(db.String(50), unique=True, nullable=False)

    nombre = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(200), nullable=False)

    fecha_alta = db.Column(db.DateTime, server_default=db.func.now())
 
    anuncios = db.relationship("Anuncio", backref="usuario", lazy=True)
 