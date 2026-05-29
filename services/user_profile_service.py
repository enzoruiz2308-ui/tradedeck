from config import db
from dtos.api_dtos import user_to_dto
from models.user_profile import UserProfile
from models.usuario import Usuario


class UserProfileService:
    def get_user(self, usuario_id):
        usuario = db.session.get(Usuario, int(usuario_id))
        return user_to_dto(usuario) if usuario else None

    def update_profile(self, usuario_id, datos):
        usuario = db.session.get(Usuario, int(usuario_id))
        if not usuario:
            return None, "Usuario no encontrado"

        username = datos.get("username")
        if username is not None:
            username = username.strip()
            if len(username) < 3:
                return None, "El username debe tener al menos 3 caracteres"
            usuario.nombre = username

        profile = usuario.profile
        if not profile:
            profile = UserProfile(usuario_id=usuario.id, rating=0)
            db.session.add(profile)

        if "avatar" in datos:
            profile.avatar = datos.get("avatar") or None
        if "bio" in datos:
            profile.bio = datos.get("bio") or None

        db.session.commit()
        return user_to_dto(usuario), None
