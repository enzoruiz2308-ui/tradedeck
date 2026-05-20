from flask import Flask, jsonify, request
import requests
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import bcrypt

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tradedeck.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(200), nullable=False)


    with app.app_context():
        db.create_all()

    @app.route("/api/usuarios", methods=["POST"])  

    def crear_usuario():
        datos = request.get_json()

        if not datos or not datos.get("nombre") or not datos.get("email") or not datos.get("password"):
            return jsonify({"error": "El email ya está registrado"}), 409


        nuevo_usuario  Usuario(
            nombre=datos["nombre"],
            email=datos["email"]
            password=datos["password"]
        ) 


        db.session.add(nuevo_usuario)
        db.session.commit()

        return jsonify({"mensaje": "Usuario Creado", "id": nuevo_usuario.id}), 201
    

@app.route("/api/usuarios", methods=["POST"])
def crear_usuario():
    datos = request.get_json()

    if not datos or not datos.get("nombre") or not datos.get("email") or not datos.get("password"):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if Usuario.query.filter_by(email=datos["email"]).first():
        return jsonify({"error": "El email ya está registrado"}), 409

  
    password_encriptada = bcrypt.hashpw(datos["password"].encode("utf-8"), bcrypt.gensalt())

    nuevo_usuario = Usuario(
        nombre=datos["nombre"],
        email=datos["email"],
        password=password_encriptada.decode("utf-8")
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({"mensaje": "Usuario creado", "id": nuevo_usuario.id}), 201

app.config["JWT_SECRET_KEY"] = "enzopolno2006/23/8"  
jwt = JWTManager(app)

@app.route("/api/login", methods=["POST"])
def login():
    datos = request.get_json()

    if not datos or not datos.get("email") or not datos.get("password"):
        return jsonify({"error": "Faltan email o password"}), 400

    usuario = Usuario.query.filter_by(email=datos["email"]).first()

    # Comprobamos que existe y que la contraseña es correcta
    if not usuario or not bcrypt.checkpw(datos["password"].encode("utf-8"), usuario.password.encode("utf-8")):
        return jsonify({"error": "Email o contraseña incorrectos"}), 401

    # Generamos el token JWT
    token = create_access_token(identity=str(usuario.id))

    return jsonify({"token": token, "nombre": usuario.nombre})


# Ruta protegida — solo accesible con token
@app.route("/api/perfil", methods=["GET"])
@jwt_required()
def perfil():
    usuario_id = get_jwt_identity()
    usuario = db.session.get(Usuario, int(usuario_id))
    return jsonify({"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email})

class Anuncio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tipo = db.Column(db.String(10), nullable=False)       # "venta" o "compra"
    juego = db.Column(db.String(20), nullable=False)      # "pokemon" o "onepiece"
    nombre_carta = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Float, nullable=False)
    descripcion = db.Column(db.String(300))
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)

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

# Crear anuncio (requiere estar logueado)
@app.route("/api/anuncios", methods=["POST"])
@jwt_required()
def crear_anuncio():
    datos = request.get_json()
    usuario_id = get_jwt_identity()

    if not datos or not datos.get("tipo") or not datos.get("juego") or not datos.get("nombre_carta") or not datos.get("precio"):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    if datos["tipo"] not in ["venta", "compra"]:
        return jsonify({"error": "El tipo debe ser 'venta' o 'compra'"}), 400

    if datos["juego"] not in ["pokemon", "onepiece"]:
        return jsonify({"error": "El juego debe ser 'pokemon' o 'onepiece'"}), 400

    anuncio = Anuncio(
        tipo=datos["tipo"],
        juego=datos["juego"],
        nombre_carta=datos["nombre_carta"],
        precio=datos["precio"],
        descripcion=datos.get("descripcion", ""),
        usuario_id=int(usuario_id)
    )

    db.session.add(anuncio)
    db.session.commit()

    return jsonify({"mensaje": "Anuncio creado", "id": anuncio.id}), 201


# Listar anuncios con filtros opcionales
@app.route("/api/anuncios", methods=["GET"])
def listar_anuncios():
    tipo = request.args.get("tipo")       # ?tipo=venta
    juego = request.args.get("juego")     # ?juego=pokemon

    consulta = Anuncio.query

    if tipo:
        consulta = consulta.filter_by(tipo=tipo)
    if juego:
        consulta = consulta.filter_by(juego=juego)

    anuncios = consulta.all()

    return jsonify([{
        "id": a.id,
        "tipo": a.tipo,
        "juego": a.juego,
        "nombre_carta": a.nombre_carta,
        "precio": a.precio,
        "descripcion": a.descripcion,
        "usuario_id": a.usuario_id
    } for a in anuncios])


# Eliminar anuncio (solo el dueño puede eliminarlo)
@app.route("/api/anuncios/<int:id>", methods=["DELETE"])
@jwt_required()
def eliminar_anuncio(id):
    usuario_id = get_jwt_identity()
    anuncio = db.session.get(Anuncio, id)

    if not anuncio:
        return jsonify({"error": "Anuncio no encontrado"}), 404

    if str(anuncio.usuario_id) != usuario_id:
        return jsonify({"error": "No tienes permiso para eliminar este anuncio"}), 403

    db.session.delete(anuncio)
    db.session.commit()

    return jsonify({"mensaje": "Anuncio eliminado"})

if __name__ == "__main__":
    app.run(debug=True)