# 🚀 TradeDeck - Guía de Preparación para la Presentación

Este documento contiene las instrucciones detalladas para instalar las dependencias de cero en otro ordenador, iniciar el proyecto y resolver cualquier inconveniente.

---

## 📥 Requisitos Iniciales (Si descargas el proyecto de cero en otro ordenador)

Dado que las carpetas de dependencias (`node_modules/`, `.venv/`) y el archivo de base de datos (`tradedeck_local.db`) no se suben a GitHub (están ignorados en `.gitignore` o son archivos locales), si clonas o descargas el repositorio en un ordenador nuevo mañana, debes seguir estos pasos para prepararlo todo:

### 🐍 1. Configurar el Backend (Python)
Abre tu terminal en la carpeta principal `tradedeck/` y ejecuta los siguientes comandos:

1. **Crear el entorno virtual**:
   ```bash
   python -m venv .venv
   ```
2. **Instalar dependencias**:
   Para evitar errores de compilación con paquetes binarios nativos en Windows, instala únicamente las dependencias de Python puro necesarias para la demo local ejecutando:
   ```bash
   .\.venv\bin\pip.exe install flask flask-cors flask-sqlalchemy flask-jwt-extended requests
   ```
   *(Nota: No te preocupes por `bcrypt`. El proyecto ya incluye un módulo fallback en local `bcrypt.py` que realiza las funciones criptográficas en Python puro sin requerir compilación C/C++).*
3. **Inicializar y poblar la Base de Datos**:
   Crea el archivo de base de datos local y los usuarios Enzo, Iker y Alvaro ejecutando:
   ```bash
   .\.venv\bin\python.exe seed_local_db.py
   ```

---

### ⚛️ 2. Configurar el Frontend (React Native + Expo)
Abre una terminal nueva en la carpeta del frontend `tradedeck/frontend/` y ejecuta:

1. **Instalar dependencias de Node**:
   ```bash
   npm install
   ```
2. **Crear el archivo de variables de entorno** (si no existe):
   Verifica si existe el archivo `.env` dentro de `tradedeck/frontend/`. Si no se ha descargado de Git, créalo y ponle esta única línea:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8000/api
   ```

---

## 🛠️ Instrucciones paso a paso para iniciar el proyecto (Cada vez que lo uses)

Una vez hechas las instalaciones del paso anterior, sigue estos dos sencillos pasos para iniciar todo:

### Paso 1: Levantar el Backend (Python + Flask)
1. Abre una terminal en la carpeta principal `tradedeck/`.
2. Ejecuta el siguiente comando para levantar el servidor local en el puerto `8000`:
   ```bash
   .\.venv\bin\python.exe run_local.py
   ```
3. Sabrás que funciona porque en la terminal aparecerá `* Running on http://127.0.0.1:8000`. Déjala abierta.

### Paso 2: Levantar el Frontend (React Native + Expo Web)
1. Abre **otra terminal** distinta en la carpeta del frontend: `tradedeck/frontend/`.
2. Levanta el servidor de desarrollo en modo web ejecutando:
   ```bash
   npm run web
   ```
3. Se compilará el frontend y se abrirá automáticamente en tu navegador predeterminado bajo la dirección `http://localhost:8081`.

---

## 🌟 Resumen de Errores Críticos que han sido Corregidos

Aquí tienes una lista de los fallos que solucionamos para que puedas explicárselo a tu grupo o al profesor si te preguntan:

1. **Fuga de chats entre sesiones (Caché)**:
   * *Error*: Si un usuario cerraba sesión e ingresaba otro, la pantalla de "Mis Mensajes" mostraba los chats del usuario anterior renderizados con el perfil del nuevo.
   * *Solución*: Implementamos un hook `useFocusEffect` reactivo que recarga en vivo los chats del usuario en sesión actual cada vez que entras a la pantalla y limpia la memoria al salir, logrando un aislamiento total.

2. **Error al eliminar anuncios con chats activos (`Network Error`)**:
   * *Error*: Si un anuncio tenía un chat o mensaje y el vendedor lo borraba, SQLite lanzaba un fallo de integridad (error 500 / Network Error) porque intentaba poner el ID del anuncio a NULL en la tabla de chats.
   * *Solución*: Configuramos la eliminación en cascada (`cascade="all, delete-orphan"`) en el backend. Ahora, borrar un anuncio elimina automáticamente y de forma segura todos sus chats y mensajes asociados sin romper nada.

3. **Cuelgue al eliminar anuncios en Web**:
   * *Error*: El botón "Eliminar" en el perfil llamaba a una función móvil nativa (`Alert.alert`) que no funciona en navegadores web y provocaba que la web se colgara.
   * *Solución*: Modificamos el frontend para detectar si estás en la Web y usar un diálogo estándar (`window.confirm`), manteniendo la alerta nativa en dispositivos móviles.

4. **Error de layout en el contenedor de "Mis Mensajes"**:
   * *Error*: Al entrar a la lista de chats, la pantalla fallaba con un error de React Native indicando que los estilos de alineación debían aplicarse mediante la propiedad `contentContainerStyle`.
   * *Solución*: Corregimos las propiedades del componente `<Screen>` y el estilo de alineación para cumplir con la especificación de diseño.

5. **Mejora del Buscador (Keystroke Lag) y Soporte Offline para Otama**:
   * *Error*: Cada letra escrita en el buscador disparaba llamadas instantáneas a la API, alentando la aplicación.
   * *Solución*: Añadimos un botón "Buscar" y soporte para la tecla **Enter/Intro** para gatillar la búsqueda de forma controlada.
   * *Soporte Offline*: Guardamos las cartas de Otama OP13 y OP01 en el catálogo local de SQLite para que la búsqueda por nombre funcione instantáneamente incluso si el internet de la escuela falla o bloquea la API pública.
