from config import db


class CartaCache(db.Model):
    __tablename__ = "cartas_cache"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(100), nullable=False)
    tcg = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    set_name = db.Column(db.String(200), nullable=False)
    rarity = db.Column(db.String(50), nullable=False)
    image = db.Column(db.String(500), nullable=False)
    market_price = db.Column(db.Float, default=0)
    payload = db.Column(db.JSON)
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    __table_args__ = (
        db.UniqueConstraint("external_id", "tcg", name="uq_cartas_cache_external_tcg"),
    )
