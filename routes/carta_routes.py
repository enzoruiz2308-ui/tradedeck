# Importamos Blueprint para agrupar rutas, jsonify para devolver JSON, request para leer parámetros de la URL
from flask import Blueprint, jsonify, request
# Importamos requests para hacer peticiones HTTP a APIs externas
import requests

# Creamos el blueprint de cartas — agrupa todas las rutas relacionadas con cartas
carta_bp = Blueprint("cartas", __name__)

# API key de Pokémon TCG — necesaria para autenticarnos con la API
TCG_API_KEY = "6aa78c0f-6ffa-49b1-bf74-260af788499f"
# URL base de la Pokémon TCG API — todas las peticiones empiezan por aquí
TCG_URL = "https://api.pokemontcg.io/v2"

# Ruta para buscar cartas por nombre — GET /api/carta/pokemon/<nombre>
@carta_bp.route("/api/carta/pokemon/<nombre>", methods=["GET"])
def carta_pokemon(nombre):
    """
    Buscar cartas Pokémon por nombre
    ---
    tags:
      - Cartas
    parameters:
      - in: path
        name: nombre
        type: string
        required: true
        example: pikachu
    responses:
      200:
        description: Lista de cartas encontradas
      404:
        description: Carta no encontrada
    """
    # Llamamos a la TCG API buscando cartas cuyo nombre coincida con el parámetro
    # q=name: es el filtro de búsqueda de la TCG API
    # headers= manda la API key para autenticarnos
    respuesta = requests.get(
        f"{TCG_URL}/cards?q=name:{nombre}",
        headers={"X-Api-Key": TCG_API_KEY}
    )

    # Si la TCG API devuelve un error (no 200) devolvemos 404
    if respuesta.status_code != 200:
        return jsonify({"error": f"No se encontró la carta: {nombre}"}), 404

    # Convertimos la respuesta a diccionario Python
    datos = respuesta.json()

    # Si la lista de cartas está vacía significa que no existe esa carta
    if not datos["data"]:
        return jsonify({"error": f"No se encontró la carta: {nombre}"}), 404

    # Recorremos la lista de cartas y filtramos solo los campos que necesitamos
    cartas = [{
        "id": c["id"],                      # identificador único de la carta (ej: xy1-1)
        "nombre": c["name"],                # nombre de la carta (ej: Pikachu)
        "imagen": c["images"]["large"],     # imagen grande de la carta real
        "rareza": c.get("rarity", ""),      # rareza (Common, Rare, Holo...) — .get() evita error si no existe
        "set": c["set"]["name"],            # expansión a la que pertenece (ej: Base Set)
        "numero": c.get("number", "")       # número dentro del set (ej: 58/102)
    } for c in datos["data"]]              # iteramos sobre todas las cartas devueltas

    # Devolvemos el total de cartas encontradas y la lista
    return jsonify({"total": len(cartas), "cartas": cartas}), 200


# Ruta para listar cartas con paginación — GET /api/cartas/pokemon
@carta_bp.route("/api/cartas/pokemon", methods=["GET"])
def listar_cartas():
    """
    Listar cartas Pokémon con paginación
    ---
    tags:
      - Cartas
    parameters:
      - in: query
        name: page
        type: integer
        required: false
        example: 1
      - in: query
        name: pageSize
        type: integer
        required: false
        example: 20
    responses:
      200:
        description: Lista de cartas Pokémon
      500:
        description: Error conectando con TCG API
    """
    # Leemos los parámetros de la URL — si no vienen usamos valores por defecto
    # Ejemplo: /api/cartas/pokemon?page=2&pageSize=10
    pagina = request.args.get("page", 1)        # página actual, por defecto 1
    cantidad = request.args.get("pageSize", 20) # cartas por página, por defecto 20

    # Llamamos a la TCG API con paginación
    respuesta = requests.get(
        f"{TCG_URL}/cards?page={pagina}&pageSize={cantidad}",
        headers={"X-Api-Key": TCG_API_KEY}
    )

    # Si falla la conexión con la TCG API devolvemos error 500 (error del servidor)
    if respuesta.status_code != 200:
        return jsonify({"error": "No se pudo conectar con la TCG API"}), 500

    # Convertimos la respuesta a diccionario Python
    datos = respuesta.json()

    # Filtramos solo los campos necesarios para el listado — usamos imagen pequeña para ir más rápido
    cartas = [{
        "id": c["id"],
        "nombre": c["name"],
        "imagen": c["images"]["small"],     # imagen pequeña — más rápida para mostrar en listados
        "rareza": c.get("rarity", ""),
        "set": c["set"]["name"]
    } for c in datos["data"]]

    # Devolvemos el total global de cartas (no solo las de esta página), la página actual y la lista
    return jsonify({
        "total": datos["totalCount"],   # total de cartas en toda la API (no solo esta página)
        "pagina": pagina,               # página actual
        "cartas": cartas                # lista de cartas de esta página
    }), 200
