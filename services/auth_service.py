import bcrypt
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token

from config import db
from dtos.api_dtos import user_to_dto
from models.user_profile import UserProfile
from models.usuario import Usuario


class AuthService:
    def register(self, datos):
        username = (datos.get("username") or "").strip()
        email = (datos.get("email") or "").strip().lower()
        password = datos.get("password") or ""

        if not username or not email or not password:
            return None, "Username, email y password son obligatorios"
        if Usuario.query.filter_by(email=email).first():
            return None, "El email ya esta registrado"

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        usuario = Usuario(nombre=username, email=email, password=password_hash)
        db.session.add(usuario)
        db.session.flush()
        db.session.add(UserProfile(usuario_id=usuario.id, rating=0))
        db.session.commit()
        return self._auth_response(usuario), None

    def login(self, datos):
        email = (datos.get("email") or "").strip().lower()
        password = datos.get("password") or ""
        usuario = Usuario.query.filter_by(email=email).first()

        if not usuario or not bcrypt.checkpw(password.encode("utf-8"), usuario.password.encode("utf-8")):
            return None, "Email o contrasena incorrectos"

        return self._auth_response(usuario), None

    def refresh(self, refresh_token):
        if not refresh_token:
            return None, "Refresh token obligatorio"
        try:
            payload = decode_token(refresh_token)
        except Exception:
            return None, "Refresh token invalido"
        if payload.get("type") != "refresh":
            return None, "Refresh token invalido"

        usuario = db.session.get(Usuario, int(payload["sub"]))
        if not usuario:
            return None, "Usuario no encontrado"
        return self._auth_response(usuario), None

    def me(self, usuario_id):
        usuario = db.session.get(Usuario, int(usuario_id))
        if not usuario:
            return None
        return user_to_dto(usuario)

    def _auth_response(self, usuario):
        identity = str(usuario.id)
        return {
            "accessToken": create_access_token(identity=identity),
            "refreshToken": create_refresh_token(identity=identity),
            "user": user_to_dto(usuario),
        }
