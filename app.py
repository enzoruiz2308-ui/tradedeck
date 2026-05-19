from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def inicio():
    return "tradedeck API funciona"

@app.route("/api/estado")
def estado():
    return jsonify({
        "app": "TradeDeck",
        "version": "1.0",
        "estado": "online"
    })

@app.route("/api/carta/<nombre>")
def buscar_carta(nombre):
    return jsonify({
        "buscando": nombre,
        "mensaje": f"Buscando la carta: {nombre}"
    })

if __name__ == "__main__":
    app.run(debug=True)