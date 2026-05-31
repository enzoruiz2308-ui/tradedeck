from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
service = AuthService()


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    response, error = service.register(request.get_json() or {})
    if error:
        return jsonify({"error": error}), 400
    return jsonify(response), 201


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    response, error = service.login(request.get_json() or {})
    if error:
        return jsonify({"error": error}), 401
    return jsonify(response), 200


@auth_bp.route("/auth/refresh", methods=["POST"])
@auth_bp.route("/api/auth/refresh", methods=["POST"])
def refresh():
    refresh_token = (request.get_json() or {}).get("refreshToken")
    response, error = service.refresh(refresh_token)
    if error:
        return jsonify({"error": error}), 401
    return jsonify(response), 200


@auth_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user = service.me(get_jwt_identity())
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user), 200
