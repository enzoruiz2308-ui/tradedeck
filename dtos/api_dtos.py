from datetime import datetime


def _iso(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value else None


def user_to_dto(usuario):
    profile = getattr(usuario, "profile", None)
    return {
        "id": str(usuario.id),
        "username": usuario.nombre,
        "email": usuario.email,
        "avatar": profile.avatar if profile else None,
        "bio": profile.bio if profile else None,
        "rating": profile.rating if profile and profile.rating is not None else 0,
        "createdAt": _iso(usuario.fecha_alta),
    }


def card_to_dto(card):
    return {
        "id": str(card["id"]),
        "tcg": card["tcg"],
        "game": card["tcg"],
        "name": card["name"],
        "set": card["set"],
        "rarity": card["rarity"],
        "image": card["image"],
        "marketPrice": card.get("marketPrice", 0),
    }


def paginated_response(data, page, limit, total):
    total_pages = (total + limit - 1) // limit if limit else 1
    return {
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "totalPages": max(total_pages, 1),
    }


def listing_to_dto(listing, card=None):
    return {
        "id": str(listing.id),
        "type": listing.type,
        "cardId": listing.card_id,
        "tcg": listing.tcg,
        "sellerId": str(listing.seller_id),
        "description": listing.description,
        "price": listing.price,
        "card": card,
        "seller": user_to_dto(listing.seller) if getattr(listing, "seller", None) else None,
        "condition": listing.condition,
        "grading": listing.grading or {"company": "raw"},
        "status": listing.status,
        "createdAt": _iso(listing.created_at),
        "updatedAt": _iso(listing.updated_at),
    }


def collection_item_to_dto(item, card=None):
    return {
        "id": str(item.id),
        "cardId": item.card_id,
        "tcg": item.tcg,
        "card": card,
        "quantity": item.quantity,
        "condition": item.condition,
        "grading": item.grading or {"company": "raw"},
        "notes": item.notes,
        "createdAt": _iso(item.created_at),
        "updatedAt": _iso(item.updated_at),
    }
