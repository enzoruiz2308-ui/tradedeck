from config import db


class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)
    card_id = db.Column(db.String(100), nullable=False)
    tcg = db.Column(db.String(20), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    description = db.Column(db.String(500))
    price = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(30), nullable=False)
    grading = db.Column(db.JSON, nullable=False, default=dict)
    status = db.Column(db.String(20), nullable=False, default="active")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    seller = db.relationship("Usuario", backref=db.backref("listings", lazy=True))
