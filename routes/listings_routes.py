from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.listing_service import ListingService

listings_bp = Blueprint("listings_api", __name__)
service = ListingService()


@listings_bp.route("/listings", methods=["GET"])
def list_listings():
    return jsonify(service.list(request.args)), 200


@listings_bp.route("/listings/<int:listing_id>", methods=["GET"])
def get_listing(listing_id):
    listing = service.get(listing_id)
    if not listing:
        return jsonify({"error": "Anuncio no encontrado"}), 404
    return jsonify(listing), 200


@listings_bp.route("/listings", methods=["POST"])
@jwt_required()
def create_listing():
    listing, error = service.create(request.get_json() or {}, get_jwt_identity())
    if error:
        return jsonify({"error": error}), 400
    return jsonify(listing), 201


@listings_bp.route("/listings/<int:listing_id>", methods=["PUT"])
@jwt_required()
def update_listing(listing_id):
    listing, error = service.update(listing_id, request.get_json() or {}, get_jwt_identity())
    if error:
        status = 404 if "no encontrado" in error.lower() else 403 if "permiso" in error.lower() else 400
        return jsonify({"error": error}), status
    return jsonify(listing), 200


@listings_bp.route("/listings/<int:listing_id>", methods=["DELETE"])
@jwt_required()
def delete_listing(listing_id):
    ok, error = service.delete(listing_id, get_jwt_identity())
    if not ok:
        status = 404 if "no encontrado" in error.lower() else 403
        return jsonify({"error": error}), status
    return "", 204
