from flask import Flask, jsonify
from flask_cors import CORS
from flasgger import Swagger
from config import Config, db, jwt
from routes.usuario_routes import usuario_bp
from routes.anuncio_routes import anuncio_bp
from routes.carta_routes import carta_bp
from routes.auth_routes import auth_bp
from routes.cards_routes import cards_bp
from routes.collection_routes import collection_bp
from routes.listings_routes import listings_bp
from routes.users_routes import users_bp
from routes.chat_routes import chat_bp

# Import all models so db.create_all() can create the new backend tables.
from models.carta_cache import CartaCache  # noqa: F401
from models.collection_item import CollectionItem  # noqa: F401
from models.listing import Listing  # noqa: F401
from models.user_profile import UserProfile  # noqa: F401
from models.chat import ChatSession, ChatMessage  # noqa: F401

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["SWAGGER"] = {"title": "TradeDeck API", "uiversion": 3}

    db.init_app(app)
    jwt.init_app(app)
    Swagger(app)
    CORS(app)

    @jwt.invalid_token_loader
    def invalid_token(reason):
        return jsonify({"error": "Token de sesion invalido. Inicia sesion con un usuario real del backend."}), 401

    @jwt.unauthorized_loader
    def missing_token(reason):
        return jsonify({"error": "Sesion requerida. Inicia sesion para continuar."}), 401

    @jwt.expired_token_loader
    def expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Sesion caducada. Vuelve a iniciar sesion."}), 401

    @jwt.revoked_token_loader
    def revoked_token(jwt_header, jwt_payload):
        return jsonify({"error": "Sesion revocada. Vuelve a iniciar sesion."}), 401

    app.register_blueprint(usuario_bp)
    app.register_blueprint(anuncio_bp)
    app.register_blueprint(carta_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(cards_bp)
    app.register_blueprint(collection_bp)
    app.register_blueprint(listings_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(chat_bp)

    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        return 'TradeDeck API funcionando'

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)
