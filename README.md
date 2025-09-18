# Eventify - Backend

Aplicación backend para gestionar tareas, proyectos, clientes, productos y departamentos. Está construida con Node.js y Express, usando archivos JSON como almacenamiento simple.

## Características
- Listado y gestión de tareas (crear, editar, eliminar, ver detalle).
- Rutas para clientes, productos, proyectos y departamentos.
- Motor de vistas `pug` para las vistas del servidor.
- Persistencia simple en archivos JSON dentro de `src/data`.

## Requisitos
- Node.js 16+

## Instalación
1. Clona el repositorio o descarga el código.
2. Instala dependencias:

```powershell
npm install
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

Listado de endpoints que devuelven JSON y pueden consumirse como API:

- `GET /tasks/json` - Obtener todas las tareas en formato JSON.
- `GET /tasks/user/:userId/json` - Obtener las tareas asignadas a un usuario (JSON).

- `GET /clients/json` - Obtener todos los clientes (JSON).
- `POST /clients` - Crear un cliente.

- `GET /products/json` - Obtener productos (JSON).

- `GET /projects/json` - Obtener proyectos (JSON).
- `POST /projects` - Crear un proyecto.

- `GET /departments/json` - Obtener departamentos (JSON).


## Notas
- Este proyecto usa almacenamiento en archivos JSON; en una versión futura se migrara a mongoDB.
