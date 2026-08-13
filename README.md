# Nativa

Tienda online pequeña.

Nativa está diseñada inicialmente para una tienda familiar, pero debe mantenerse genérica para poder vender diferentes tipos de productos en el futuro.

## Stack

* **Vite** — Build tool
* **Vanilla JavaScript** — Frontend
* **Tailwind CSS** — Estilos
* **Supabase** — Backend

  * PostgreSQL
  * Authentication
  * Storage
  * Row Level Security (RLS)
* **GitHub Pages** — Hosting

## Objetivo

Construir un catálogo online sencillo que permita:

* Mostrar productos y categorías.
* Consultar precios y stock desde Supabase.
* Mostrar el detalle de cada producto.
* Administrar productos desde un panel privado.
* Gestionar imágenes mediante Supabase Storage.
* Indicar la disponibilidad de los productos.
* Redirigir al cliente a WhatsApp para realizar la compra.

La primera versión **no tendrá sistema de pedidos, pagos ni checkout propio**.

## Arquitectura

GitHub Pages sirve el frontend estático. Supabase proporciona los datos y servicios dinámicos.

```text
                  GitHub Pages
                       │
                       ▼
                Vite + Vanilla JS
                       │
              ┌────────┴────────┐
              │                 │
         Storefront           Admin
              │                 │
              └────────┬────────┘
                       │
                   Supabase
              ┌────────┼────────┐
              │        │        │
             Auth   PostgreSQL Storage
                       │
                      RLS
```

Supabase es la fuente de verdad para el catálogo.

La seguridad debe implementarse mediante **Supabase Auth + Row Level Security (RLS)**. El frontend no debe utilizar secretos ni depender de ocultar rutas para proteger los datos.

## Datos

El modelo inicial será deliberadamente pequeño:

```text
categories
products
```

### `categories`

Categorías utilizadas para organizar los productos.

### `products`

Información básica del catálogo:

* Nombre
* Slug
* Descripción
* Precio
* Stock
* Categoría
* Imagen
* Estado de publicación

No hay una tabla de roles: no existe registro público, las cuentas se crean manualmente (Supabase Dashboard → Authentication), y cualquier usuario autenticado tiene permisos de administrador.

### Storage

**Supabase Storage** se utilizará para almacenar las imágenes de los productos.

## Flujo de compra

No se almacenarán pedidos inicialmente.

```text
Cliente
   ↓
Catálogo
   ↓
Producto
   ↓
¿Disponible?
   ↓
Comprar
   ↓
WhatsApp
```

Si el producto está disponible, el botón **Comprar** generará un mensaje con la información del producto y abrirá WhatsApp de la tienda.

## Panel administrativo

El panel permitirá inicialmente:

* Iniciar sesión.
* Crear productos.
* Editar productos.
* Cambiar precios.
* Actualizar stock.
* Subir imágenes.
* Publicar o desactivar productos.

Las operaciones administrativas estarán protegidas mediante **Supabase Auth + RLS**.

## Rutas iniciales

```text
/
├── /productos
├── /productos/:slug
│
└── /admin
    ├── /login
    ├── /productos
    ├── /productos/nuevo
    └── /productos/:id
```

El routing se implementará inicialmente con **Vanilla JavaScript + History API**.

## Estado actual

* [x] Proyecto Vite creado.
* [x] Vanilla JavaScript.
* [x] Tailwind CSS configurado.
* [x] Proyecto Supabase creado.
* [x] GitHub Pages definido como hosting.
* [x] Estructura del proyecto.
* [x] Router.
* [x] Modelo de datos en Supabase (migración aplicada al proyecto remoto).
* [x] Conexión con Supabase.
* [x] Storefront.
* [x] Catálogo.
* [x] Autenticación.
* [x] Panel administrativo.
* [x] Gestión de imágenes.
* [x] Integración con WhatsApp.
* [x] Deploy (workflow listo; falta habilitar GitHub Pages y cargar los secrets — ver sección Dominio).

## Principios

1. Mantener el proyecto simple.
2. Evitar infraestructura innecesaria.
3. Mantener el frontend modular.
4. Utilizar Supabase como fuente de verdad.
5. Utilizar RLS para proteger los datos.
6. Evitar dependencias innecesarias.
7. Mantener la tienda independiente del tipo de producto.
8. Priorizar una administración sencilla para usuarios no técnicos.
9. Implementar primero las necesidades reales y evitar funcionalidades prematuras.
