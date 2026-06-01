from config import db
from dtos.api_dtos import listing_to_dto, paginated_response
from models.listing import Listing
from services.card_service import CardService


class ListingService:
    allowed_types = {"sell", "buy"}
    allowed_statuses = {"active", "reserved", "sold", "paused", "expired"}
    allowed_conditions = {"Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"}
    allowed_tcgs = {"pokemon", "onepiece"}

    def __init__(self):
        self.cards = CardService()

    def list(self, params):
        page = max(int(params.get("page", 1)), 1)
        limit = min(max(int(params.get("limit", 20)), 1), 100)
        query = Listing.query

        for key, column in (
            ("tcg", Listing.tcg),
            ("status", Listing.status),
            ("type", Listing.type),
            ("condition", Listing.condition),
        ):
            value = params.get(key)
            if value and value != "all":
                query = query.filter(column == value)

        search = (params.get("query") or "").strip()
        if search:
            query = query.filter(Listing.description.ilike(f"%{search}%") | Listing.card_id.ilike(f"%{search}%"))
        if params.get("minPrice") is not None:
            query = query.filter(Listing.price >= float(params["minPrice"]))
        if params.get("maxPrice") is not None:
            query = query.filter(Listing.price <= float(params["maxPrice"]))

        query = self._sort(query, params.get("sortBy"), params.get("sortOrder", "desc"))
        total = query.count()
        rows = query.offset((page - 1) * limit).limit(limit).all()
        return paginated_response([self._to_dto(row) for row in rows], page, limit, total)

    def get(self, listing_id):
        listing = db.session.get(Listing, int(listing_id))
        return self._to_dto(listing) if listing else None

    def create(self, datos, usuario_id):
        error = self._validate(datos)
        if error:
            return None, error
        self.cards.ensure_cached(datos["cardId"], datos["tcg"])
        listing = Listing(
            type=datos["type"],
            card_id=datos["cardId"],
            tcg=datos["tcg"],
            seller_id=int(usuario_id),
            description=datos.get("description") or "",
            price=float(datos["price"]),
            condition=datos["condition"],
            grading=datos.get("grading") or {"company": "raw"},
            status=datos.get("status") or "active",
        )
        db.session.add(listing)
        db.session.commit()
        return self._to_dto(listing), None

    def update(self, listing_id, datos, usuario_id):
        listing = db.session.get(Listing, int(listing_id))
        if not listing:
            return None, "Anuncio no encontrado"
        if listing.seller_id != int(usuario_id):
            return None, "No tienes permiso para modificar este anuncio"

        for field, attr in (
            ("type", "type"),
            ("cardId", "card_id"),
            ("tcg", "tcg"),
            ("description", "description"),
            ("price", "price"),
            ("condition", "condition"),
            ("grading", "grading"),
            ("status", "status"),
        ):
            if field in datos:
                setattr(listing, attr, datos[field])

        error = self._validate(
            {
                "type": listing.type,
                "cardId": listing.card_id,
                "tcg": listing.tcg,
                "price": listing.price,
                "condition": listing.condition,
                "grading": listing.grading,
                "status": listing.status,
            }
        )
        if error:
            return None, error
        listing.price = float(listing.price)
        db.session.commit()
        return self._to_dto(listing), None

    def delete(self, listing_id, usuario_id):
        listing = db.session.get(Listing, int(listing_id))
        if not listing:
            return False, "Anuncio no encontrado"
        if listing.seller_id != int(usuario_id):
            return False, "No tienes permiso para eliminar este anuncio"
        db.session.delete(listing)
        db.session.commit()
        return True, None

    def by_user(self, usuario_id):
        rows = Listing.query.filter_by(seller_id=int(usuario_id)).order_by(Listing.created_at.desc()).all()
        return [self._to_dto(row) for row in rows]

    def _validate(self, datos):
        if datos.get("type") not in self.allowed_types:
            return "El tipo debe ser sell o buy"
        if datos.get("tcg") not in self.allowed_tcgs:
            return "El tcg debe ser pokemon o onepiece"
        if not datos.get("cardId"):
            return "La carta es obligatoria"
        try:
            if float(datos.get("price") or 0) <= 0:
                return "El precio debe ser mayor que cero"
        except (ValueError, TypeError):
            return "El precio debe ser un número válido"
        if datos.get("condition") not in self.allowed_conditions:
            return "Estado de carta no valido"
        if datos.get("status") and datos.get("status") not in self.allowed_statuses:
            return "Status de anuncio no valido"
        return None

    def _sort(self, query, sort_by, sort_order):
        column = Listing.created_at
        if sort_by == "price":
            column = Listing.price
        elif sort_by == "status":
            column = Listing.status
        return query.order_by(column.desc() if sort_order == "desc" else column.asc())

    def _to_dto(self, listing):
        card = self.cards.get_card(listing.card_id, listing.tcg)
        return listing_to_dto(listing, card)
