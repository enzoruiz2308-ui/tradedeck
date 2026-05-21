from config import db
from models.usuario import Usuario

class UsuarioDAO:

    def obtener_todos(self):
        return Usuario.query.all()

    def obtener_por_id(self, id):
        return db.session.get(Usuario, id)

    def obtener_por_email(self, email):
        return Usuario.query.filter_by(email=email).first()

    def crear(self, usuario):
        db.session.add(usuario)
        db.session.commit()
        return usuario

    def actualizar(self):
        db.session.commit()

    def eliminar(self, usuario):
        db.session.delete(usuario)
        db.session.commit()