from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.collection_service import CollectionService

collection_bp = Blueprint("collection_api", __name__)
service = CollectionService()


@collection_bp.route("/api/me/collection", methods=["GET"])
@jwt_required()
def list_collection():
    return jsonify(service.list(get_jwt_identity())), 200


@collection_bp.route("/api/me/collection", methods=["POST"])
@jwt_required()
def add_collection_item():
    item, error = service.add(get_jwt_identity(), request.get_json() or {})
    if error:
        return jsonify({"error": error}), 400
    return jsonify(item), 201


@collection_bp.route("/api/me/collection/<int:item_id>", methods=["PATCH"])
@jwt_required()
def update_collection_item(item_id):
    item, error = service.update(item_id, get_jwt_identity(), request.get_json() or {})
    if error:
        status = 404 if "no encontrado" in error.lower() else 400
        return jsonify({"error": error}), status
    return jsonify(item), 200


@collection_bp.route("/api/me/collection/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_collection_item(item_id):
    ok, error = service.delete(item_id, get_jwt_identity())
    if not ok:
        return jsonify({"error": error}), 404
    return "", 204
