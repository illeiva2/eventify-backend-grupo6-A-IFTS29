# Eventify - Backend

Aplicación backend para gestionar tareas, proyectos, clientes, productos y departamentos. Está construida con Node.js y Express, usando archivos JSON como almacenamiento simple.

## Características
- Listado y gestión de tareas (crear, editar, eliminar, ver detalle).
- Rutas para clientes, productos, proyectos y departamentos.
- Motor de vistas `pug` para las vistas del servidor.
- Autenticación mediante JWT (JSON Web Tokens).
- Persistencia en MongoDB mediante Mongoose.

## Requisitos
- Node.js 16+

## Instalación
1. Clona el repositorio o descarga el código.
2. Instala dependencias:

```powershell
npm install
```

3. Configura las variables de entorno creando un archivo `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=Eventify
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
PORT=3000
```

## Ejecutar

Inicia la aplicación:

```powershell
npm start
```

Por defecto el servidor se ejecuta en `http://localhost:3000`.

## Estructura principal
- `src/app.js` - Configuración de Express y montaje de rutas.
- `src/routes/` - Definición de rutas (tasks, clients, products, projects, departments).
- `src/controllers/` - Lógica de los endpoints.
- `src/services/jsonDb.js` - Helper para leer/escribir JSON en `src/data`.
- `src/models/` - Modelos sencillos usados para crear entidades.
- `src/data/` - Datos iniciales almacenados en JSON.

## Rutas API (JSON)

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan@eventify.com",
    "password": "password123",
    "role": "admin",
    "departmentId": "opcional"
  }
  ```

- `POST /api/auth/login` - Iniciar sesión
  ```json
  {
    "email": "juan@eventify.com",
    "password": "password123"
  }
  ```
  Retorna un token JWT que debe incluirse en las peticiones protegidas.

- `GET /api/auth/profile` - Obtener perfil del usuario autenticado (requiere token)

### Uso del Token JWT

Para usar las rutas protegidas, incluye el token en el header `Authorization`:

```
Authorization: Bearer <tu_token_jwt>
```

### Otras Rutas API

- `GET /tasks/json` - Obtener todas las tareas en formato JSON.
- `GET /tasks/user/:userId/json` - Obtener las tareas asignadas a un usuario (JSON).

- `GET /clients/json` - Obtener todos los clientes (JSON).
- `POST /clients` - Crear un cliente.

- `GET /products/json` - Obtener productos (JSON).

- `GET /projects/json` - Obtener proyectos (JSON).
- `POST /projects` - Crear un proyecto.

- `GET /departments/json` - Obtener departamentos (JSON).

## Middleware de Autenticación

Para proteger rutas, usa el middleware `authenticate` de `src/middleware/auth.js`:

```javascript
import { authenticate } from './middleware/auth.js';

router.get('/ruta-protegida', authenticate, controller);
```

## Notas
- El proyecto usa MongoDB mediante Mongoose para persistencia de datos.
- Las contraseñas se hashean automáticamente usando bcrypt antes de guardarse.
- Los tokens JWT expiran en 7 días por defecto.
- Asegúrate de cambiar `JWT_SECRET` en producción por una clave segura y aleatoria.
