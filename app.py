from flask import Flask
from config import Config, db, jwt
from routes.usuario_routes import usuario_bp
from routes.anuncio_routes import anuncio_bp
from routes.carta_routes import carta_bp
 
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
 
    db.init_app(app)
    jwt.init_app(app)
 
    app.register_blueprint(usuario_bp)
    app.register_blueprint(anuncio_bp)
    app.register_blueprint(carta_bp)
 
    with app.app_context():
        db.create_all()
 
    return app
 
@app.route('/')
def index():
    return 'TradeDeck API funcionando'
 
if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)