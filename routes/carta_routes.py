from flask import Blueprint, jsonify
import requests

carta_bp = Blueprint("cartas", __name__)

@carta_bp.route("/api/carta/pokemon/<nombre>", methods=["GET"])
def carta_pokemon(nombre):
    respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon/{nombre.lower()}")
    if respuesta.status_code != 200:
        return jsonify({"error": f"No se encontró el Pokémon: {nombre}"}), 404
    datos = respuesta.json()
    return jsonify({
        "id": datos["id"],
        "nombre": datos["name"],
        "imagen": datos["sprites"]["front_default"],
        "tipos": [t["type"]["name"] for t in datos["types"]],
        "hp": datos["stats"][0]["base_stat"]
    }), 200

@carta_bp.route("/api/cartas/pokemon", methods=["GET"])
@carta_bp.route("/api/cartas/pokemon/<int:cantidad>", methods=["GET"])
def listar_pokemon(cantidad=20):
    respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon?limit={cantidad}")
    if respuesta.status_code != 200:
        return jsonify({"error": "No se pudo conectar con la PokéAPI"}), 500
    datos = respuesta.json()
    cartas = [{"nombre": p["name"], "url": p["url"]} for p in datos["results"]]
    return jsonify({"total": len(cartas), "cartas": cartas}), 200