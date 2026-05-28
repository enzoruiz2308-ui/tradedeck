# TradeDeck - Backend API REST

API REST del proyecto TradeDeck, una aplicación para comprar y vender cartas coleccionables de Pokémon y One Piece.

## Tecnologías

- Python + Flask
- SQLAlchemy (ORM)
- PostgreSQL
- flask-jwt-extended (autenticación JWT)
- Flasgger (documentación Swagger)
- bcrypt (encriptación de contraseñas)

## Arquitectura por capas

tradedeck/
├── app.py              → Arranca la aplicación
├── config.py           → Configuración y conexión a BD
├── models/             → Clases que representan las tablas
├── daos/               → Acceso a la base de datos
├── services/           → Lógica de negocio
├── routes/             → Endpoints HTTP
└── dtos/               → Validación de entrada y salida

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/enzoruiz2308-ui/tradedeck.git
cd tradedeck
git checkout desarrollo
```

2. Crea el entorno virtual e instala dependencias:
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1      # Windows
source .venv/bin/activate       # Linux/Mac
pip install -r requirements.txt
```

3. Configura la base de datos en `config.py`:
```python
SQLALCHEMY_DATABASE_URI = "postgresql://tradedeck:tradedeck123@172.17.26.141:5432/tradedeckdb"
```

4. Arranca el servidor:
```bash
python app.py
```

El servidor corre en `http://localhost:8000`

## Documentación Swagger

Accede a la documentación interactiva en:

http://localhost:8000/apidocs

## Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/usuarios | Registrar usuario | No |
| POST | /api/login | Login, devuelve token JWT | No |
| GET | /api/perfil | Ver perfil propio | Sí |
| GET | /api/usuarios | Listar usuarios | No |
| GET | /api/usuarios/{id} | Obtener usuario por ID | No |
| GET | /api/anuncios | Listar anuncios | No |
| GET | /api/anuncios/{id} | Obtener anuncio por ID | No |
| POST | /api/anuncios | Crear anuncio | Sí |
| DELETE | /api/anuncios/{id} | Eliminar anuncio | Sí |
| GET | /api/carta/pokemon/{nombre} | Buscar carta Pokémon | No |
| GET | /api/cartas/pokemon | Listar cartas Pokémon | No |

## Ejemplo de uso

**Registro:**
```json
POST /api/usuarios
{
  "nombre": "Enzo",
  "email": "enzo@tradedeck.com",
  "password": "1234"
}
```

**Login:**
```json
POST /api/login
{
  "email": "enzo@tradedeck.com",
  "password": "1234"
}
```

**Crear anuncio** (con token en header `Authorization: Bearer <token>`):
```json
POST /api/anuncios
{
  "tipo": "venta",
  "juego": "pokemon",
  "nombre_carta": "Pikachu",
  "precio": 5.99,
  "descripcion": "Carta en perfecto estado"
}
```

## Equipo

Alvaro Barra
Iker Mayor Oñate
Enzo Ruiz Loze
Marc Ayala