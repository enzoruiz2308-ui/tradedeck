import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import bcrypt

# Establecer la variable de entorno para usar la base de datos local SQLite
os.environ["TRADEDECK_DATABASE_URI"] = "sqlite:///tradedeck_local.db"

ROOT = Path(__file__).resolve().parent
sys.path.append(str(ROOT))

# Eliminar base de datos local previa para empezar limpio
paths_to_delete = [
    ROOT / "tradedeck_local.db",
    ROOT / "instance" / "tradedeck_local.db",
]
for p in paths_to_delete:
    if p.exists():
        try:
            p.unlink()
            print(f"Eliminado: {p}")
        except Exception as e:
            print(f"Error al eliminar {p}: {e}")

from app import create_app
from config import db
from models.usuario import Usuario
from models.user_profile import UserProfile
from models.carta_cache import CartaCache
from models.anuncio import Anuncio
from models.listing import Listing
from models.collection_item import CollectionItem
from models.chat import ChatSession, ChatMessage

app = create_app()

with app.app_context():
    print("Creando todas las tablas en tradedeck_local.db...")
    db.create_all()

    # --- 1. Crear Cartas Caché (Pokémon y One Piece) ---
    print("Cargando cartas en caché local (CartaCache)...")
    
    # Cartas de Pokemon
    cartas_pokemon = [
        CartaCache(
            external_id="swsh4-74",
            tcg="pokemon",
            name="Charizard VMAX",
            set_name="Vivid Voltage",
            rarity="Rare Holo VMAX",
            image="https://images.pokemontcg.io/swsh4/74_hires.png",
            market_price=18.50,
            payload={"set": "Vivid Voltage", "number": "74"}
        ),
        CartaCache(
            external_id="base1-58",
            tcg="pokemon",
            name="Pikachu",
            set_name="Base Set",
            rarity="Common",
            image="https://images.pokemontcg.io/base1/58_hires.png",
            market_price=1.25,
            payload={"set": "Base Set", "number": "58"}
        ),
        CartaCache(
            external_id="sm35-78",
            tcg="pokemon",
            name="Mewtwo GX",
            set_name="Shining Legends",
            rarity="Rare Ultra",
            image="https://images.pokemontcg.io/sm3.5/78_hires.png",
            market_price=12.00,
            payload={"set": "Shining Legends", "number": "78"}
        ),
        CartaCache(
            external_id="base1-2",
            tcg="pokemon",
            name="Blastoise",
            set_name="Base Set",
            rarity="Rare Holo",
            image="https://images.pokemontcg.io/base1/2_hires.png",
            market_price=85.00,
            payload={"set": "Base Set", "number": "2"}
        )
    ]
    
    # Cartas de One Piece
    cartas_onepiece = [
        CartaCache(
            external_id="OP01-024",
            tcg="onepiece",
            name="Monkey D. Luffy",
            set_name="Romance Dawn",
            rarity="Super Rare",
            image="https://images.optcgapi.com/cards/OP01-024.png",
            market_price=15.00,
            payload={"set": "Romance Dawn", "number": "OP01-024"}
        ),
        CartaCache(
            external_id="OP01-001",
            tcg="onepiece",
            name="Roronoa Zoro",
            set_name="Romance Dawn",
            rarity="Leader",
            image="https://images.optcgapi.com/cards/OP01-001.png",
            market_price=5.50,
            payload={"set": "Romance Dawn", "number": "OP01-001"}
        ),
        CartaCache(
            external_id="OP01-016",
            tcg="onepiece",
            name="Nami",
            set_name="Romance Dawn",
            rarity="Rare",
            image="https://images.optcgapi.com/cards/OP01-016.png",
            market_price=22.00,
            payload={"set": "Romance Dawn", "number": "OP01-016"}
        ),
        CartaCache(
            external_id="OP02-013",
            tcg="onepiece",
            name="Portgas D. Ace",
            set_name="Paramount War",
            rarity="Super Rare",
            image="https://images.optcgapi.com/cards/OP02-013.png",
            market_price=35.00,
            payload={"set": "Paramount War", "number": "OP02-013"}
        )
    ]

    for c in cartas_pokemon + cartas_onepiece:
        db.session.add(c)
    db.session.flush()

    # --- 2. Crear Usuarios y Perfiles ---
    print("Creando usuarios de prueba con contraseñas encriptadas...")
    
    pass_hash = bcrypt.hashpw("1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    u_enzo = Usuario(nombre="Enzo", email="enzo@tradedeck.com", password=pass_hash)
    u_marc = Usuario(nombre="Marc", email="marc@tradedeck.com", password=pass_hash)
    u_lucia = Usuario(nombre="Lucia", email="lucia@tradedeck.com", password=pass_hash)
    
    db.session.add(u_enzo)
    db.session.add(u_marc)
    db.session.add(u_lucia)
    db.session.flush()

    p_enzo = UserProfile(
        usuario_id=u_enzo.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Enzo", 
        bio="Coleccionista y vendedor de cartas Pokémon Vintage y One Piece. ¡Envíos rápidos!", 
        rating=4.8
    )
    p_marc = UserProfile(
        usuario_id=u_marc.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Marc", 
        bio="Buscando completar mi colección de Romance Dawn. Tratos en mano en Barcelona.", 
        rating=5.0
    )
    p_lucia = UserProfile(
        usuario_id=u_lucia.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Lucia", 
        bio="Apasionada del TCG de Pokémon desde la infancia. Compro y cambio en toda España.", 
        rating=4.5
    )
    
    db.session.add(p_enzo)
    db.session.add(p_marc)
    db.session.add(p_lucia)
    db.session.flush()

    # --- 3. Crear Anuncios (Legacy) y Listings ---
    print("Creando anuncios y listados de cartas...")
    
    # Anuncios (Legacy)
    a1 = Anuncio(tipo="venta", juego="pokemon", nombre_carta="base1-58", precio=1.25, descripcion="Carta Pikachu común en perfecto estado, ideal para coleccionar.", usuario_id=u_enzo.id)
    a2 = Anuncio(tipo="venta", juego="onepiece", nombre_carta="OP01-024", precio=15.00, descripcion="Luffy SR Romance Dawn, guardada en funda desde el primer día.", usuario_id=u_marc.id)
    a3 = Anuncio(tipo="compra", juego="pokemon", nombre_carta="base1-2", precio=80.00, descripcion="Busco Blastoise original Base Set, pago según estado (mínimo Excellent).", usuario_id=u_lucia.id)
    a4 = Anuncio(tipo="venta", juego="onepiece", nombre_carta="OP01-001", precio=5.50, descripcion="Zoro Leader en perfecto estado.", usuario_id=u_enzo.id)
    
    db.session.add(a1)
    db.session.add(a2)
    db.session.add(a3)
    db.session.add(a4)
    db.session.flush()

    # Listings
    l1 = Listing(type="sell", card_id="base1-58", tcg="pokemon", seller_id=u_enzo.id, price=1.25, condition="Near Mint", description="Carta Pikachu común en perfecto estado, ideal para coleccionar.", grading={"company": "raw"}, status="active")
    l2 = Listing(type="sell", card_id="OP01-024", tcg="onepiece", seller_id=u_marc.id, price=15.00, condition="Mint", description="Luffy SR Romance Dawn, guardada en funda desde el primer día.", grading={"company": "raw"}, status="active")
    l3 = Listing(type="buy", card_id="base1-2", tcg="pokemon", seller_id=u_lucia.id, price=80.00, condition="Excellent", description="Busco Blastoise original Base Set, pago según estado (mínimo Excellent).", grading={"company": "raw"}, status="active")
    l4 = Listing(type="sell", card_id="OP01-001", tcg="onepiece", seller_id=u_enzo.id, price=5.50, condition="Near Mint", description="Zoro Leader en perfecto estado.", grading={"company": "raw"}, status="active")

    db.session.add(l1)
    db.session.add(l2)
    db.session.add(l3)
    db.session.add(l4)
    db.session.flush()

    # --- 4. Colecciones de los Usuarios (CollectionItem) ---
    print("Creando inventarios de colecciones para los perfiles...")
    
    col_items = [
        CollectionItem(usuario_id=u_enzo.id, card_id="swsh4-74", tcg="pokemon", quantity=1, condition="Mint", notes="Mi joya de la corona"),
        CollectionItem(usuario_id=u_enzo.id, card_id="OP01-001", tcg="onepiece", quantity=2, condition="Near Mint", notes="Para cambiar"),
        CollectionItem(usuario_id=u_marc.id, card_id="OP01-024", tcg="onepiece", quantity=1, condition="Mint", notes="Para mazo principal"),
        CollectionItem(usuario_id=u_marc.id, card_id="base1-58", tcg="pokemon", quantity=5, condition="Played", notes="Cartas repetidas"),
        CollectionItem(usuario_id=u_lucia.id, card_id="sm35-78", tcg="pokemon", quantity=1, condition="Near Mint", notes="Comprada en tienda")
    ]
    for ci in col_items:
        db.session.add(ci)
    db.session.flush()

    # --- 5. Sesiones de Chat y Mensajes de Prueba ---
    print("Inicializando chats de prueba activos...")
    
    chat1 = ChatSession(anuncio_id=a1.id, comprador_id=u_marc.id, vendedor_id=u_enzo.id)
    db.session.add(chat1)
    db.session.flush()

    now = datetime.utcnow()
    m1 = ChatMessage(chat_id=chat1.id, remitente_id=u_marc.id, texto="Hola, ¿sigue disponible la carta de Pikachu?", fecha_envio=now - timedelta(hours=1))
    m2 = ChatMessage(chat_id=chat1.id, remitente_id=u_enzo.id, texto="¡Hola! Sí, está en perfecto estado. Si quieres te mando más fotos por aquí.", fecha_envio=now - timedelta(minutes=45))
    m3 = ChatMessage(chat_id=chat1.id, remitente_id=u_marc.id, texto="Me interesa bastante. ¿Haces envíos a Madrid?", fecha_envio=now - timedelta(minutes=30))
    m4 = ChatMessage(chat_id=chat1.id, remitente_id=u_enzo.id, texto="Sí, hago envíos por correo certificado por 4.50€ adicionales o correo ordinario bajo tu responsabilidad.", fecha_envio=now - timedelta(minutes=20))
    m5 = ChatMessage(chat_id=chat1.id, remitente_id=u_marc.id, texto="Perfecto, me quedo con el certificado. Pásame tus datos por privado.", fecha_envio=now - timedelta(minutes=10))

    db.session.add(m1)
    db.session.add(m2)
    db.session.add(m3)
    db.session.add(m4)
    db.session.add(m5)

    db.session.commit()
    print("¡Base de datos local recreada y poblada con éxito!")
