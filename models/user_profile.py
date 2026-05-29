from config import db


class UserProfile(db.Model):
    __tablename__ = "user_profiles"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), unique=True, nullable=False)
    avatar = db.Column(db.String(500))
    bio = db.Column(db.String(180))
    rating = db.Column(db.Float, default=0)

    usuario = db.relationship(
        "Usuario",
        backref=db.backref("profile", uselist=False, cascade="all, delete-orphan"),
    )
