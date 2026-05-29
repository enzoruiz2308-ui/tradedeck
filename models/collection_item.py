from config import db


class CollectionItem(db.Model):
    __tablename__ = "collection_items"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    card_id = db.Column(db.String(100), nullable=False)
    tcg = db.Column(db.String(20), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    condition = db.Column(db.String(30), nullable=False)
    grading = db.Column(db.JSON, nullable=False, default=dict)
    notes = db.Column(db.String(180))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    usuario = db.relationship("Usuario", backref=db.backref("collection_items", lazy=True))

    __table_args__ = (
        db.UniqueConstraint("usuario_id", "card_id", "tcg", name="uq_collection_user_card_tcg"),
    )
