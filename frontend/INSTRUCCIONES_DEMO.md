# Guía de Instalación y Demostración Local (TradeDeck)

Esta guía te indica los pasos para poner en marcha la aplicación TradeDeck (tanto backend como frontend) de manera local en los ordenadores de clase. La base de datos está configurada con SQLite y se almacena localmente de forma independiente, por lo que **no depende de ningún servidor externo**.

---

## 📋 Requisitos Previos

Asegúrate de que el ordenador de clase tenga instalado:
1. **Python** (versión 3.10 o superior).
2. **Node.js** (versión 18 o superior) junto con `npm`.

---

## 🚀 Paso 1: Configurar e Iniciar el Backend

El servidor de la base de datos y la API corre con Flask. Sigue estos pasos para prepararlo:

1. **Abre una terminal** en la carpeta raíz del proyecto (`tradedeck`).
2. **Crea y activa el entorno virtual de Python**:
   * **En Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   * **En Windows (CMD)**:
     ```cmd
     python -m venv .venv
     .venv\Scripts\activate.bat
     ```
   * **En macOS/Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. **Instala las dependencias**:
   ```bash
   pip install flask flask-cors flask-sqlalchemy flask-jwt-extended requests
   ```
   *(Nota: Se ha configurado un fallback de bcrypt por software en `bcrypt.py` para evitar que Windows falle al compilar dependencias C++ / Rust en clase).*
4. **Poblar la Base de Datos Local**:
   Genera el archivo local de SQLite y precarga las colecciones y cartas ejecutando el script de seeding:
   ```bash
   python seed_local_db.py
   ```
   *Esto limpiará anuncios y chats antiguos para que empieces con una base de datos limpia lista para la demostración en vivo.*
5. **Iniciar el servidor local**:
   ```bash
   python run_local.py
   ```
   El backend estará corriendo en `http://localhost:8000`. Mantén esta terminal abierta.

---

## 💻 Paso 2: Configurar e Iniciar el Frontend (Web)

El frontend está desarrollado con React Native Expo y se ejecuta en el navegador.

1. **Abre una segunda terminal** y navega a la carpeta `frontend/`:
   ```bash
   cd frontend
   ```
2. **Instala las dependencias de Node**:
   ```bash
   npm install
   ```
3. **Configurar variables de entorno**:
   Asegúrate de que haya un archivo llamado `.env` en la carpeta `frontend/` con el siguiente contenido:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api
   ```
4. **Iniciar el Servidor de Desarrollo**:
   ```bash
   npm run web
   ```
   Esto compilará la aplicación y abrirá automáticamente una pestaña en tu navegador web en `http://localhost:8081`.

---

## 🔑 Cuentas de Prueba Pre-configuradas

Para la demostración, puedes registrar nuevos usuarios o utilizar cualquiera de estas cuentas pre-cargadas en la base de datos (todas usan la contraseña **`1234`**):

* **Enzo**: `enzo@tradedeck.com` (Tiene cartas de One Piece y Pokémon en colección, ideal para publicar ventas).
* **Marc**: `marc@tradedeck.com`
* **Lucia**: `lucia@tradedeck.com`

---

## 🛠️ Preguntas Frecuentes y Solución de Problemas

### 1. ¿Cómo pruebo desde el móvil físico en clase?
Si quieres que los profesores vean la app en el móvil escaneando el código QR:
1. Conecta el móvil y el PC de clase a la **misma red Wi-Fi**.
2. Obtén la IP local del PC de clase (ejecutando `ipconfig` en Windows, ej. `192.168.1.45`).
3. Modifica el archivo `frontend/.env` para apuntar a la IP del PC:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.45:8000/api
   ```
4. Inicia el frontend con `npm start` y escanea el QR con la app **Expo Go** en tu móvil.

### 2. Error "401 Unauthorized" o expiración de sesión
Se ha configurado la expiración del Token de acceso JWT en el backend a **30 días**, por lo que no deberías tener problemas de expiración durante la presentación.

### 3. Las imágenes de las cartas creadas no cargan
La app consulta la información visual de las cartas del catálogo de manera dinámica al cargar los anuncios. Si creas anuncios desde el catálogo global de compra, las imágenes se cargarán y asociarán automáticamente en la pantalla de inicio y en los perfiles.
