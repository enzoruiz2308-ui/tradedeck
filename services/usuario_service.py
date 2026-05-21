import bcrypt
from flask_jwt_extended import create_access_token
from daos.usuario_dao import UsuarioDAO
from models.usuario import Usuario

dao = UsuarioDAO()

class UsuarioService:

    def listar(self):
        return dao.obtener_todos()

    def obtener_por_id(self, id):
        return dao.obtener_por_id(id)

    def registrar(self, datos):
        if dao.obtener_por_email(datos["email"]):
            return None, "El email ya está registrado"

        password_encriptada = bcrypt.hashpw(
            datos["password"].encode("utf-8"), bcrypt.gensalt()
        )
        usuario = Usuario(
            nombre=datos["nombre"],
            email=datos["email"],
            password=password_encriptada.decode("utf-8")
        )
        return dao.crear(usuario), None

    def login(self, datos):
        usuario = dao.obtener_por_email(datos["email"])
        if not usuario:
            return None, None, "Email o contraseña incorrectos"

        if not bcrypt.checkpw(datos["password"].encode("utf-8"), usuario.password.encode("utf-8")):
            return None, None, "Email o contraseña incorrectos"

        token = create_access_token(identity=str(usuario.id))
        return usuario, token, None