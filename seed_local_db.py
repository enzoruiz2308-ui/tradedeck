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
        ),
        CartaCache(
            external_id="OP01-006",
            tcg="onepiece",
            name="Otama",
            set_name="Romance Dawn",
            rarity="Common",
            image="https://www.optcgapi.com/media/static/Card_Images/OP01-006.jpg",
            market_price=0.47,
            payload={"set": "Romance Dawn", "number": "OP01-006"}
        ),
        CartaCache(
            external_id="OP13-043_ARa00EL",
            tcg="onepiece",
            name="Otama",
            set_name="Carrying On His Will",
            rarity="Rare",
            image="https://www.optcgapi.com/media/static/Card_Images/OP13-043_ARa00EL.jpg",
            market_price=0.29,
            payload={"set": "Carrying On His Will", "number": "OP13-043"}
        )
    ]

    for c in cartas_pokemon + cartas_onepiece:
        db.session.add(c)
    db.session.flush()

    # --- 2. Crear Usuarios y Perfiles ---
    print("Creando usuarios de prueba con contraseñas encriptadas...")
    
    hash_enzo = bcrypt.hashpw("Enzo1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    hash_iker = bcrypt.hashpw("Iker1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    hash_alvaro = bcrypt.hashpw("Alvaro1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    
    u_enzo = Usuario(nombre="Enzo", email="enzo@tradedeck.com", password=hash_enzo)
    u_iker = Usuario(nombre="Iker", email="iker@tradedeck.com", password=hash_iker)
    u_alvaro = Usuario(nombre="Alvaro", email="alvaro@tradedeck.com", password=hash_alvaro)
    
    db.session.add(u_enzo)
    db.session.add(u_iker)
    db.session.add(u_alvaro)
    db.session.flush()

    p_enzo = UserProfile(
        usuario_id=u_enzo.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Enzo", 
        bio="Coleccionista y vendedor de cartas Pokémon Vintage y One Piece. ¡Envíos rápidos!", 
        rating=4.8
    )
    p_iker = UserProfile(
        usuario_id=u_iker.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Iker", 
        bio="Buscando completar mi colección de Romance Dawn. Tratos en mano en Barcelona.", 
        rating=5.0
    )
    p_alvaro = UserProfile(
        usuario_id=u_alvaro.id, 
        avatar="https://api.dicebear.com/7.x/adventurer/svg?seed=Alvaro", 
        bio="Apasionada del TCG de Pokémon desde la infancia. Compro y cambio en toda España.", 
        rating=4.5
    )
    
    db.session.add(p_enzo)
    db.session.add(p_iker)
    db.session.add(p_alvaro)
    db.session.flush()

    # --- 3. Colecciones de los Usuarios (CollectionItem) ---
    print("Creando inventarios de colecciones para los perfiles...")
    
    col_items = [
        CollectionItem(usuario_id=u_enzo.id, card_id="swsh4-74", tcg="pokemon", quantity=1, condition="Mint", notes="Mi joya de la corona"),
        CollectionItem(usuario_id=u_enzo.id, card_id="OP01-006", tcg="onepiece", quantity=1, condition="Near Mint", notes="Otama Romance Dawn"),
        CollectionItem(usuario_id=u_iker.id, card_id="OP13-043_ARa00EL", tcg="onepiece", quantity=1, condition="Mint", notes="Otama OP13"),
        CollectionItem(usuario_id=u_iker.id, card_id="OP01-024", tcg="onepiece", quantity=1, condition="Mint", notes="Para cambiar"),
        CollectionItem(usuario_id=u_alvaro.id, card_id="base1-58", tcg="pokemon", quantity=5, condition="Played", notes="Repetidas Pikachu")
    ]
    for ci in col_items:
        db.session.add(ci)
    db.session.flush()

    db.session.commit()
    print("¡Base de datos local recreada y poblada con éxito con usuarios, colecciones y caches de Otama (sin anuncios ni chats)!")
