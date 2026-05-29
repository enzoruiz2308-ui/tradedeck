feature/backend-api
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

# \# TradeDeck — Pokémon \& One Piece Card Market

# 

# App móvil de compraventa de cartas coleccionables.

# 

# \## Equipo

# \- Rol 1 Frontend: Marc y Álvaro

# \- Rol 2 Backend: Iker

# \- Rol 3 Data Master: Marc y Álvaro

# \- Rol 4 SysAdmin \& QA: Enzo

# 

# \## Servidores

# \- Servidor 1 BBDD: 172.17.26.141:5432

# \- Servidor 2 API: 172.17.23.213:8000

# 

# \## Instalación del backend

# 1\. Conectarse al servidor por SSH: ssh enzo@172.17.23.213

# 2\. cd tradedeck

# 3\. source venv/bin/activate

# 4\. python3 app.py

# 

# \## Base de datos

# \- Motor: PostgreSQL

# \- Host: 172.17.26.141

# \- Puerto: 5432

# \- Base de datos: tradedeckdb

# \- Usuario: tradedeck

# 

# \## Tecnologías

# \- Frontend: React Native con Expo

# \- Backend: Python Flask

# \- Base de datos: PostgreSQL

# \- Servidores: Ubuntu Server en VMware

develop
