from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.anuncio_service import AnuncioService
from dtos.anuncio_dto import dto_entrada_anuncio, dto_salida_anuncio

anuncio_bp = Blueprint("anuncios", __name__)
service = AnuncioService()

@anuncio_bp.route("/api/anuncios", methods=["GET"])
def listar():
    """
    Listar anuncios con filtros opcionales
    ---
    tags:
      - Anuncios
    parameters:
      - in: query
        name: tipo
        type: string
        description: venta o compra
      - in: query
        name: juego
        type: string
        description: pokemon o onepiece
    responses:
      200:
        description: Lista de anuncios
    """
    tipo = request.args.get("tipo")
    juego = request.args.get("juego")
    anuncios = service.listar(tipo=tipo, juego=juego)
    return jsonify([dto_salida_anuncio(a) for a in anuncios]), 200

@anuncio_bp.route("/api/anuncios/<int:id>", methods=["GET"])
def obtener(id):
    """
    Obtener anuncio por ID
    ---
    tags:
      - Anuncios
    parameters:
      - in: path
        name: id
        type: integer
        required: true
    responses:
      200:
        description: Anuncio encontrado
      404:
        description: Anuncio no encontrado
    """
    anuncio = service.obtener_por_id(id)
    if not anuncio:
        return jsonify({"error": "Anuncio no encontrado"}), 404
    return jsonify(dto_salida_anuncio(anuncio)), 200

@anuncio_bp.route("/api/anuncios", methods=["POST"])
@jwt_required()
def crear():
    """
    Crear un nuevo anuncio
    ---
    tags:
      - Anuncios
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        schema:
          properties:
            tipo:
              type: string
              example: venta
            juego:
              type: string
              example: pokemon
            nombre_carta:
              type: string
              example: Pikachu
            precio:
              type: number
              example: 5.99
            descripcion:
              type: string
              example: Carta en perfecto estado
    responses:
      201:
        description: Anuncio creado
      400:
        description: Datos incorrectos
    """
    datos = request.get_json()
    errores = dto_entrada_anuncio(datos or {})
    if errores:
        return jsonify({"errores": errores}), 400
    usuario_id = get_jwt_identity()
    anuncio = service.crear(datos, usuario_id)
    return jsonify({"mensaje": "Anuncio creado", "id": anuncio.id}), 201

@anuncio_bp.route("/api/anuncios/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar(id):
    """
    Eliminar anuncio por ID
    ---
    tags:
      - Anuncios
    security:
      - Bearer: []
    parameters:
      - in: path
        name: id
        type: integer
        required: true
    responses:
      200:
        description: Anuncio eliminado
      403:
        description: Sin permiso
      404:
        description: Anuncio no encontrado
    """
    usuario_id = get_jwt_identity()
    ok, error = service.eliminar(id, usuario_id)
    if not ok:
        codigo = 404 if "encontrado" in error else 403
        return jsonify({"error": error}), codigo
    return jsonify({"mensaje": "Anuncio eliminado"}), 200