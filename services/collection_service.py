from sqlalchemy.exc import IntegrityError

from config import db
from dtos.api_dtos import collection_item_to_dto
from models.collection_item import CollectionItem
from services.card_service import CardService


class CollectionService:
    allowed_conditions = {"Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"}
    allowed_tcgs = {"pokemon", "onepiece"}

    def __init__(self):
        self.cards = CardService()

    def list(self, usuario_id):
        rows = CollectionItem.query.filter_by(usuario_id=int(usuario_id)).order_by(CollectionItem.created_at.desc()).all()
        return [self._to_dto(row) for row in rows]

    def add(self, usuario_id, datos):
        error = self._validate(datos, require_card=True)
        if error:
            return None, error
        self.cards.ensure_cached(datos["cardId"], datos["tcg"])
        item = CollectionItem(
            usuario_id=int(usuario_id),
            card_id=datos["cardId"],
            tcg=datos["tcg"],
            quantity=int(datos.get("quantity") or 1),
            condition=datos["condition"],
            grading=datos.get("grading") or {"company": "raw"},
            notes=datos.get("notes"),
        )
        db.session.add(item)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            existing = CollectionItem.query.filter_by(
                usuario_id=int(usuario_id),
                card_id=datos["cardId"],
                tcg=datos["tcg"],
            ).first()
            existing.quantity += int(datos.get("quantity") or 1)
            existing.condition = datos["condition"]
            existing.grading = datos.get("grading") or existing.grading
            existing.notes = datos.get("notes", existing.notes)
            db.session.commit()
            item = existing
        return self._to_dto(item), None

    def update(self, item_id, usuario_id, datos):
        item = self._owned_item(item_id, usuario_id)
        if not item:
            return None, "Item no encontrado"
        merged = {
            "tcg": item.tcg,
            "cardId": item.card_id,
            "quantity": item.quantity,
            "condition": item.condition,
            "grading": item.grading,
            "notes": item.notes,
            **datos,
        }
        error = self._validate(merged, require_card=False)
        if error:
            return None, error
        if "quantity" in datos:
            item.quantity = int(datos["quantity"])
        if "condition" in datos:
            item.condition = datos["condition"]
        if "grading" in datos:
            item.grading = datos["grading"]
        if "notes" in datos:
            item.notes = datos.get("notes")
        db.session.commit()
        return self._to_dto(item), None

    def delete(self, item_id, usuario_id):
        item = self._owned_item(item_id, usuario_id)
        if not item:
            return False, "Item no encontrado"
        db.session.delete(item)
        db.session.commit()
        return True, None

    def _validate(self, datos, require_card):
        if require_card and not datos.get("cardId"):
            return "La carta es obligatoria"
        if require_card and datos.get("tcg") not in self.allowed_tcgs:
            return "El tcg debe ser pokemon o onepiece"
        if int(datos.get("quantity") or 0) < 1:
            return "La cantidad minima es 1"
        if datos.get("condition") not in self.allowed_conditions:
            return "Estado de carta no valido"
        return None

    def _owned_item(self, item_id, usuario_id):
        return CollectionItem.query.filter_by(id=int(item_id), usuario_id=int(usuario_id)).first()

    def _to_dto(self, item):
        card = self.cards.get_card(item.card_id, item.tcg)
        return collection_item_to_dto(item, card)
