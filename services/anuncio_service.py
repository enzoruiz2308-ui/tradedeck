from daos.anuncio_dao import AnuncioDAO
from models.anuncio import Anuncio

dao = AnuncioDAO()

class AnuncioService:

    def listar(self, tipo=None, juego=None):
        return dao.obtener_todos(tipo=tipo, juego=juego)

    def obtener_por_id(self, id):
        return dao.obtener_por_id(id)

    def crear(self, datos, usuario_id):
        anuncio = Anuncio(
            tipo=datos["tipo"],
            juego=datos["juego"],
            nombre_carta=datos["nombre_carta"],
            precio=datos["precio"],
            descripcion=datos.get("descripcion", ""),
            usuario_id=int(usuario_id)
        )
        return dao.crear(anuncio)

    def eliminar(self, id, usuario_id):
        anuncio = dao.obtener_por_id(id)
        if not anuncio:
            return False, "Anuncio no encontrado"
        if str(anuncio.usuario_id) != usuario_id:
            return False, "No tienes permiso para eliminar este anuncio"
        dao.eliminar(anuncio)
        return True, None