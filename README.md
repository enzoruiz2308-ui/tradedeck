# TradeDeck

TradeDeck es una aplicación de compraventa y colección de cartas para Pokémon TCG y One Piece Card Game.
Este repositorio contiene tanto el **Backend** (API REST con Flask) como el **Frontend** (Aplicación móvil y web con React Native y Expo).

---

## 🏗️ Backend (Flask API)

El backend de TradeDeck provee todos los servicios necesarios para la gestión de usuarios, colecciones, anuncios, mensajería y la integración con las APIs públicas de cartas.

### Stack
- Python + Flask
- SQLAlchemy (ORM)
- PostgreSQL (Producción) / SQLite (Local)
- flask-jwt-extended
- bcrypt
- requests
- Flasgger

### Conexión BDD
La conexión PostgreSQL oficial se mantiene en `config.py`:
```python
SQLALCHEMY_DATABASE_URI = 'postgresql://tradedeck:tradedeck123@172.17.26.141:5432/tradedeckdb'
```
El backend crea tablas nuevas con `db.create_all()` al arrancar. No se necesita modificar la configuración.

### Arranque del Backend
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```
- Servidor: `http://localhost:8000`
- Swagger: `http://localhost:8000/apidocs`

### Modo Local De Pruebas
Para probar la app en un PC sin tocar la BDD oficial, arranca el backend con SQLite local:
```powershell
python run_local.py
```
Esto usa `sqlite:///tradedeck_local.db` mediante la variable `TRADEDECK_DATABASE_URI`. 
Para borrar la BDD local y empezar de cero: `python reset_local_db.py`.

### Contrato Principal Del Frontend
* **Auth:** `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`
* **Cartas:** `/cards`, `/cards/search`, `/cards/<id>` (Pokémon y One Piece TCG integrados)
* **Listings:** `/listings`, `/listings/<id>`, `/users/<id>/listings`
* **Usuarios y Colección:** `/users/<id>`, `/users/profile`, `/me/collection`
* **Chat Privado:** `/api/chats`, `/api/chats/<id>/mensajes`

---

## 📱 Frontend (React Native + Expo)

El frontend es una aplicación universal construida con Expo que funciona en Web, iOS y Android.

### Stack
- React Native
- Expo Router (File-based routing)
- Zustand (State management)
- Axios (API Client)

### Arranque del Frontend
Primero, navega a la carpeta del frontend e instala las dependencias:
```bash
cd frontend
npm install
```

Para arrancar el servidor de desarrollo de Expo (que permite ejecutar la app en web o en un emulador/dispositivo físico):
```bash
npm start
# O para forzar el modo web directamente:
npm run web
```

### Configuración del Frontend
El frontend se conecta al backend usando las URLs definidas en tu archivo `.env` o configuraciones por defecto.
Asegúrate de que la IP local en `EXPO_PUBLIC_API_URL` coincida con la IP de la máquina que está ejecutando el Backend (o `localhost` si lo pruebas en la misma máquina).

## 🛠 Verificación Rápida
Si quieres comprobar la sintaxis del backend rápidamente:
```bash
$files = Get-ChildItem -Path app.py,config.py,routes,services,daos,dtos,models -Recurse -File -Filter *.py | ForEach-Object { $_.FullName }
python -m py_compile @files
```
