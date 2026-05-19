from flask import Flask, jsonify
import requests

app = Flask(__name__)
    
@app.route("/api/carta/<nombre>")
def carta_pokemon(nombre):
    respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon/{nombre.lower()}")

    if respuesta.status_code != 200:
        return jsonify({"error": f"No se encontró el Pokemon {nombre}"}), 404
    
    datos = respuesta.json()

    carta = {
        "id": datos["id"],
        "nombre": datos["name"],
        "imagen":datos["sprites"]["front_default"],
        "tipos": [t["type"]["name"] for t in datos["types"]],
        "hp": datos["stats"][0]["base_stat"]
    }

    return jsonify(carta)

@app.route("/api/cartas/pokemon")
@app.route("/api/cartas/pokemon/<int:cantidad>")
def listar_pokemon(cantidad=20):
    respuesta = requests.get(f"https://pokeapi.co/api/v2/pokemon?limit={cantidad}")

    if respuesta.status_code != 200:
        return jsonify({"error": "No se pudo conectar con la PokéAPI"}), 500
    
    datos =respuesta.json()

    cartas = [{"nombre": p["name"], "url": p["url"]} for p in datos["results"]]

    return jsonify({
          "total": len(cartas),
          "cartas": cartas
    })

if __name__ == "__main__":
    app.run(debug=True)