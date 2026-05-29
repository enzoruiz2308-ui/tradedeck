from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.listing_service import ListingService
from services.user_profile_service import UserProfileService

users_bp = Blueprint("users_api", __name__)
profile_service = UserProfileService()
listing_service = ListingService()


@users_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = profile_service.get_user(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user), 200


@users_bp.route("/users/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user, error = profile_service.update_profile(get_jwt_identity(), request.get_json() or {})
    if error:
        return jsonify({"error": error}), 400
    return jsonify(user), 200


@users_bp.route("/users/<int:user_id>/listings", methods=["GET"])
def get_user_listings(user_id):
    return jsonify(listing_service.by_user(user_id)), 200
