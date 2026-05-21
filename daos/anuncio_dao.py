from config import db
from models.anuncio import Anuncio

class AnuncioDAO:

    def obtener_todos(self, tipo=None, juego=None):
        consulta = Anuncio.query
        if tipo:
            consulta = consulta.filter_by(tipo=tipo)
        if juego:
            consulta = consulta.filter_by(juego=juego)
        return consulta.all()

    def obtener_por_id(self, id):
        return db.session.get(Anuncio, id)

    def crear(self, anuncio):
        db.session.add(anuncio)
        db.session.commit()
        return anuncio

    def eliminar(self, anuncio):
        db.session.delete(anuncio)
        db.session.commit()