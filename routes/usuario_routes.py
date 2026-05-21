from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.usuario_service import UsuarioService
from dtos.usuario_dto import dto_entrada_usuario, dto_salida_usuario

usuario_bp = Blueprint("usuarios", __name__)
service = UsuarioService()

@usuario_bp.route("/api/usuarios", methods=["GET"])
def listar():
    usuarios = service.listar()
    return jsonify([dto_salida_usuario(u) for u in usuarios]), 200

@usuario_bp.route("/api/usuarios/<int:id>", methods=["GET"])
def obtener(id):
    usuario = service.obtener_por_id(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(dto_salida_usuario(usuario)), 200

@usuario_bp.route("/api/usuarios", methods=["POST"])
def registrar():
    datos = request.get_json()
    errores = dto_entrada_usuario(datos or {})
    if errores:
        return jsonify({"errores": errores}), 400
    usuario, error = service.registrar(datos)
    if error:
        return jsonify({"error": error}), 409
    return jsonify({"mensaje": "Usuario creado", "id": usuario.id}), 201

@usuario_bp.route("/api/login", methods=["POST"])
def login():
    datos = request.get_json()
    if not datos or not datos.get("email") or not datos.get("password"):
        return jsonify({"error": "Faltan email o password"}), 400
    usuario, token, error = service.login(datos)
    if error:
        return jsonify({"error": error}), 401
    return jsonify({"token": token, "nombre": usuario.nombre}), 200

@usuario_bp.route("/api/perfil", methods=["GET"])
@jwt_required()
def perfil():
    usuario_id = get_jwt_identity()
    usuario = service.obtener_por_id(int(usuario_id))
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(dto_salida_usuario(usuario)), 200