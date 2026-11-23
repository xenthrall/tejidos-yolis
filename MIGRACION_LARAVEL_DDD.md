# Plan de Migración y Arquitectura: Tejidos Yolis → E-commerce Modular en Laravel 13 (InterNACHI Modular + DDD)

> **Propósito de este documento:** Servir como especificación técnica, inventario funcional completo y guía arquitectónica para migrar el proyecto actual (**Tejidos Yolis / Nativa**) hacia un boilerplate en **Laravel 13** estructurado como **Monolito Modular** con [`internachi/modular`](https://github.com/InterNACHI/modular) y enfoque **Domain-Driven Design (DDD)**.
>
> El objetivo es doble:
> 1. **Preservar el 100% de la identidad, contenido, flujos y reglas actuales de Tejidos Yolis** desde el día 1 (paridad funcional completa).
> 2. **Diseñar una base modular y agnóstica al rubro** que permita escalar el proyecto hacia un e-commerce robusto (carrito, pedidos, pasarelas de pago, envíos, inventario avanzado, variantes, clientes y promociones) sin acoplar el dominio al catálogo artesanal inicial.

---

## Tabla de Contenido

1. [Resumen del Proyecto Actual (AS-IS)](#1-resumen-del-proyecto-actual-as-is)
2. [Inventario Completo de Tejidos Yolis (Contenido, Identidad y SEO)](#2-inventario-completo-de-tejidos-yolis-contenido-identidad-y-seo)
3. [Inventario Funcional, Rutas y Reglas de Negocio Actuales](#3-inventario-funcional-rutas-y-reglas-de-negocio-actuales)
4. [Esquema de Base de Datos y Storage Actual](#4-esquema-de-base-de-datos-y-storage-actual)
5. [Arquitectura Objetivo en Laravel 13 + InterNACHI Modular + DDD](#5-arquitectura-objetivo-en-laravel-13--internachi-modular--ddd)
6. [Diseño de Módulos (Bounded Contexts) y Estructura Interna DDD](#6-diseño-de-módulos-bounded-contexts-y-estructura-interna-ddd)
7. [Mapeo de Migración: Actual → Laravel 13 DDD](#7-mapeo-de-migración-actual--laravel-13-ddd)
8. [Evolución del Modelo de Datos (Fase 1 Paridad → Fase 2/3 E-commerce)](#8-evolución-del-modelo-de-datos-fase-1-paridad--fase-23-e-commerce)
9. [Plan de Migración de Datos y Assets desde Supabase](#9-plan-de-migración-de-datos-y-assets-desde-supabase)
10. [Lineamientos de UI/UX y Frontend a Conservar](#10-lineamientos-de-uiux-y-frontend-a-conservar)
11. [Hoja de Ruta por Fases (Roadmap Accionable)](#11-hoja-de-ruta-por-fases-roadmap-accionable)

---

## 1. Resumen del Proyecto Actual (AS-IS)

El proyecto actual (nombre interno del paquete: **`nativa`**) es una tienda/catálogo online ligera, diseñada intencionalmente para mantenerse genérica en código mientras opera comercialmente como **Tejidos Yolis**.

### Stack actual
| Capa | Tecnología actual |
| :--- | :--- |
| **Build / Frontend** | Vite 8 + Vanilla JavaScript (ESM) + Router SPA propio (History API) |
| **Estilos e Iconografía** | Tailwind CSS v4 (`@tailwindcss/vite`), `lucide`, `simple-icons` |
| **Backend / Base de Datos** | Supabase (PostgreSQL 17 + Row Level Security) |
| **Autenticación** | Supabase Auth (email + contraseña, sin registro público ni tabla de roles) |
| **Almacenamiento de Imágenes** | Supabase Storage (bucket público `product-images`) + compresión WebP en cliente |
| **Canal de Venta** | Redirección directa a WhatsApp (`https://wa.me/...`) con mensaje prellenado |
| **Despliegue** | GitHub Pages (`.github/workflows/deploy.yml`) |

### Principios actuales que deben seguir vigentes en Laravel
1. **Separación entre plataforma y marca:** El código del e-commerce debe ser genérico (multi-rubro), mientras la marca *Tejidos Yolis* vive en configuración/base de datos/tema/seeds.
2. **Administración simple para usuarios no técnicos:** El panel de gestión lo utiliza directamente la artesana/familia; los flujos deben seguir siendo claros, limpios, móviles-first y con feedback inmediato (toasts, confirmaciones destructivas).
3. **Evolución incremental:** No bloquear el lanzamiento de Tejidos Yolis esperando construir todo el e-commerce; lanzar primero paridad completa (Fase 1) con arquitectura lista para conectar módulos de carrito, pedidos y pagos (Fases 2 y 3).

---

## 2. Inventario Completo de Tejidos Yolis (Contenido, Identidad y SEO)

Toda esta información debe trasladarse intacta (ya sea mediante un `TejidosYolisSeeder` en el módulo `Storefront`/`Settings` o configuración inicial) para que la tienda no pierda identidad, posicionamiento SEO ni contenido editorial.

### 2.1 Datos de Marca y Contacto (actualmente en `src/site.config.js`)
* **Nombre de la tienda:** `Tejidos Yolis`
* **Propietaria / Artesana:** `Yolanda Rojas`
* **Ubicación:** `El Espino, Boyacá` (Colombia)
* **Moneda y Locale:** `COP` (`es-CO`, sin decimales al mostrar precios: `$150.000`)
* **Canales configurados:**
  * **WhatsApp (contacto y compras):** `+57 314 381 7069` → `https://wa.me/573143817069`
  * **Instagram:** `https://www.instagram.com/yolanditarojas1?igsh=MXZjeGVqYnp3NGo4cQ==`
  * **Facebook / TikTok / X:** Soportados por diseño (vacíos actualmente; se ocultan si no están configurados). La lógica actual acepta URL completa o `@handle` / número y lo normaliza automáticamente.
* **Mapa embebido de Google Maps (`iframe src`):**
  ```text
  https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d309.06614921488944!2d-72.49678478248451!3d6.482917078572871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e691385c8d3f455%3A0xd62aecae10ea434a!2sEl%20Espino%2C%20Boyac%C3%A1!5e1!3m2!1ses-419!2sco!4v1786653756507!5m2!1ses-419!2sco
  ```

### 2.2 Assets Gráficos a Migrar
| Archivo actual | Descripción y detalles técnicos clave |
| :--- | :--- |
| `src/assets/tejidos-yolis-oveja-logo.svg` | **Isotipo SVG inline de la oveja** (`viewBox="28 26 232 186"`). **Importante:** Debe renderizarse *inline* (no como `<img>`) porque usa variables CSS reactivas al modo oscuro (`.tejidos-logo` y `.dark .tejidos-logo` con `--ty-ink`, `--ty-wool`, `--ty-hoof`, `--ty-paper`) e incluye micro-animaciones CSS sutiles (`ty-breathe`, `ty-ear-move`, `ty-blink`). |
| `public/tejidos-yolis.png` | Imagen Open Graph / Twitter Card (`1731x909`, PNG). |
| `public/favicon.svg` y `public/favicon.ico` | Favicons del sitio. |

### 2.3 Textos Editoriales (Copy) a Conservar

#### Página de Inicio (`/`)
* **Hero Headline:**
  > *Ruanas artesanales tejidas en telar horizontal, con fibras naturales y tradición boyacense.*
* **Ubicación bajo el titular:** `El Espino, Boyacá`
* **CTAs principales:**
  * Primario: `Ver nuestras ruanas` → `/productos`
  * Secundario: `Conoce nuestra historia` → `/nosotros`
* **Destacados / Highlights (barra horizontal con separador `·`):**
  1. `🐑 Lana 100% de oveja`
  2. `Fibras naturales` (ícono `Leaf`)
  3. `Tradición boyacense` (ícono `Mountain`)
  4. `Hecho con pasión` (ícono `Heart`)
* **Sección de destacados:**
  * Título: `Ruanas destacadas`
  * Subtítulo: `Algunas de nuestras piezas`
  * Link desktop: `Ver catálogo` / Botón móvil: `Ver todo el catálogo`
  * Regla: muestra los **4 productos publicados más recientes** (`ORDER BY created_at DESC LIMIT 4`). Si no hay productos publicados, la sección completa no se renderiza.

#### Página Nosotros (`/nosotros`)
* **Introducción:**
  > *Tejidos Yolis es sinónimo de ruanas 100% de lana de oveja, tejidas en telar horizontal en El Espino, Boyacá, con la tradición textil boyacense de siempre.*
* **3 Tarjetas de Pilares:**
  1. **Lana 100% de oveja** (`Leaf`): *Cada ruana se teje con lana 100% de oveja, sin mezclas ni fibras sintéticas.*
  2. **Tejido en telar horizontal** (`HandHeart`): *Cada pieza se teje en telar horizontal, hilo a hilo, con años de experiencia en el oficio.*
  3. **Fieltro seco artesanal** (`Sparkles`): *Yolanda también trabaja el fieltro seco, con acabados de calidad profesional.*
* **Bloque Historia / Artesana (`Yolanda Rojas` — `El Espino, Boyacá`):**
  > *Yolanda es quien teje y vende cada pieza de Tejidos Yolis. Es mujer de El Espino, Boyacá, y lleva años tejiendo ruanas de lana 100% de oveja en telar horizontal, perfeccionando el oficio hilo a hilo.*
  >
  > *Además del telar, trabaja el fieltro seco, una técnica que domina hasta lograr acabados de calidad profesional. Cada ruana que sale de sus manos lleva la tradición textil boyacense y el cuidado de un trabajo hecho de principio a fin por una sola persona.*

#### Página Contacto (`/contacto`)
* **Título:** `Contacto`
* **Subtítulo:** `Escríbenos por el canal que prefieras.`
* **Mensaje prellenado de WhatsApp general:** `Hola, quiero más información.`
* **Sección mapa:** Título `Nuestro taller`, ubicación `El Espino, Boyacá`, iframe de Google Maps `aspect-[4/3]`.

### 2.4 Metadatos SEO y Datos Estructurados (actualmente en `index.html`)
* **`<html lang="es">`**
* **Title:** `Tejidos Yolis | Ruanas artesanales de El Espino, Boyacá`
* **Meta Description:** `Tejidos Yolis: ruanas artesanales tejidas en telar horizontal en El Espino, Boyacá. Tradición e hilo colombiano en cada prenda. Compra directo por WhatsApp.`
* **Meta Keywords:** `Tejidos Yolis, ruanas, ruanas artesanales, ruanas boyacenses, El Espino Boyacá, telar horizontal, ropa tradicional colombiana`
* **Open Graph:** `og:type=website`, `og:site_name=Tejidos Yolis`, `og:locale=es_CO`, `og:image=/tejidos-yolis.png` (`1731x909`)
* **Twitter Card:** `summary_large_image`
* **JSON-LD (`schema.org`):** `@type: "ClothingStore"`, `address` (`El Espino`, `Boyacá`, `CO`), `sameAs` (Instagram + WhatsApp).
  * *Mejora en Laravel:* Agregar JSON-LD `@type: "Product"` dinámico en `/productos/{slug}` con `offers`, `priceCurrency: "COP"`, `availability` (`InStock` / `OutOfStock`) y `canonical` SSR real (en la SPA actual solo existía en el `index.html` raíz).

---

## 3. Inventario Funcional, Rutas y Reglas de Negocio Actuales

### 3.1 Mapa de Rutas

#### Storefront (Público)
| Ruta actual | Descripción | Comportamiento clave |
| :--- | :--- | :--- |
| `GET /` | Home | Hero con logo SVG animado + 4 productos publicados más recientes. |
| `GET /productos` | Catálogo | Grid de productos publicados ordenados alfabéticamente (`name ASC`), skeleton loading, empty state y error state. *(En Laravel: añadir filtro por categoría, búsqueda y paginación).* |
| `GET /productos/:slug` | Detalle de producto | Muestra imagen, categoría, nombre, precio en COP, badge `Disponible`/`Agotado`, descripción y CTA `Comprar por WhatsApp` si `stock > 0` y WhatsApp está configurado. |
| `GET /nosotros` | Historia de marca | Pilares del oficio + historia de Yolanda Rojas. |
| `GET /contacto` | Canales y mapa | Botones con color de marca (WhatsApp, Instagram, etc.) + mapa embebido del taller. |
| `404` | No encontrada | Página amigable con enlace para volver al inicio. |

#### Panel Administrativo (Protegido)
| Ruta actual | Descripción | Comportamiento clave |
| :--- | :--- | :--- |
| `GET /admin/login` | Login admin | Redirige a `/admin` si ya está autenticado. Email + contraseña. |
| `GET /admin` | Dashboard | Saludo con `displayName` (fallback a `email`) + tarjetas de acceso rápido. |
| `GET /admin/productos` | Listado de productos | Tabla en desktop (`md+`) y cards en móvil. Muestra miniatura, nombre, categoría, precio, stock, badge `Publicado`/`Borrador`, acciones editar y eliminar con modal de confirmación destructiva. Orden: `created_at DESC`. |
| `GET /admin/productos/nuevo` | Crear producto | Formulario completo + subida y optimización de imagen. |
| `GET /admin/productos/:id` | Editar producto | Precarga producto y listado de categorías en paralelo. |
| `GET /admin/categorias` | Gestión de categorías | Listado alfabético con modal para crear/editar y confirmación inteligente al eliminar. |
| `GET /admin/configuracion` | Cuenta del admin | 3 formularios independientes: Perfil (`display_name` max 60), Cambio de correo (pide contraseña actual + confirmación por email), Cambio de contraseña (pide contraseña actual, mínimo 6 caracteres + confirmación). |

### 3.2 Reglas de Negocio Críticas a Preservar
1. **Visibilidad pública de productos:** Solo los productos con `is_published = true` son visibles en Storefront (Home, Catálogo, Detalle). Los borradores solo los ve el admin.
2. **Disponibilidad:** Un producto se considera **Disponible** si `stock > 0`; si `stock === 0`, se muestra como **Agotado** y se oculta el botón de compra.
3. **Generación de Slugs:**
   * Normalización Unicode `NFD`, eliminación de diacríticos/tildes, minúsculas, caracteres no alfanuméricos reemplazados por `-`, sin guiones al inicio/final.
   * Restricción única en BD (`slug UNIQUE`). Si hay colisión, se muestra un error amigable (*"Ya existe un producto/categoría con un nombre muy parecido."*).
   * *Mejora DDD en Laravel:* Permitir sufijo automático o slug editable con validación, manteniendo redirección o estabilidad de URLs para SEO.
4. **Mensaje de Compra por WhatsApp:**
   ```text
   Hola, quiero comprar *{Nombre del Producto}*
   {$Precio formateado en COP}
   {URL absoluta del producto}
   ```
   Solo se muestra el botón si `stock > 0` y existe un número de WhatsApp válido configurado.
5. **Integridad de Imágenes (Cero archivos huérfanos):**
   * Al crear/editar un producto con nueva imagen: primero se sube la nueva imagen → luego se persiste en BD → **solo si la BD tuvo éxito** se elimina la imagen anterior.
   * Si la escritura en BD falla (ej. slug duplicado), se hace rollback eliminando la imagen recién subida.
   * Al eliminar un producto, se elimina también su imagen asociada en storage.
6. **Optimización de Imágenes:**
   * Actualmente en cliente: redimensiona el lado más largo a máximo **`1600px`** y convierte a **`image/webp`** con calidad **`0.82`**, guardando con nombre `{uuid}.{ext}`.
   * En Laravel 13: puede mantenerse pre-optimización en frontend **y/o** procesamiento asíncrono/síncrono en servidor (Intervention Image / Spatie Media Library) generando variantes (`thumb`, `card`, `detail` en WebP).
7. **Eliminación segura de Categorías (`ON DELETE SET NULL`):**
   * Antes de confirmar la eliminación de una categoría, se consulta cuántos productos la tienen asignada y se advierte explícitamente al admin: *"`N` producto(s) quedará(n) sin categoría."*
   * Los productos **no** se eliminan al borrar su categoría; quedan con `category_id = null`.
8. **Seguridad en Configuración de Cuenta:**
   * Cambiar correo o contraseña exige verificar la **contraseña actual** antes de aplicar el cambio.
   * El cambio de correo requiere confirmación vía link enviado al correo antes de hacerse efectivo.

---

## 4. Esquema de Base de Datos y Storage Actual

Migración actual de referencia (`supabase/migrations/20260813175648_create_catalog_schema.sql`):

### Tabla `categories`
| Columna | Tipo actual (PG) | Restricciones |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | `NOT NULL` |
| `slug` | `text` | `NOT NULL`, `UNIQUE` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |

### Tabla `products`
| Columna | Tipo actual (PG) | Restricciones |
| :--- | :--- | :--- |
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `text` | `NOT NULL` |
| `slug` | `text` | `NOT NULL`, `UNIQUE` |
| `description` | `text` | Nullable |
| `price` | `numeric(12, 2)` | `NOT NULL`, `CHECK (price >= 0)` |
| `stock` | `integer` | `NOT NULL`, `DEFAULT 0`, `CHECK (stock >= 0)` |
| `category_id` | `uuid` | FK → `categories(id)` `ON DELETE SET NULL`, indexado |
| `image_path` | `text` | Nullable (ruta relativa en bucket `product-images`) |
| `is_published` | `boolean` | `NOT NULL`, `DEFAULT false`, índice parcial `WHERE is_published = true` |
| `created_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` |
| `updated_at` | `timestamptz` | `NOT NULL`, `DEFAULT now()` (trigger automático) |

### Storage actual
* **Bucket:** `product-images` (público para lectura, escritura solo para autenticados).

---

## 5. Arquitectura Objetivo en Laravel 13 + InterNACHI Modular + DDD

### 5.1 Por qué Monolito Modular + DDD para este proyecto
* **InterNACHI Modular (`internachi/modular`)** registra cada módulo en `app-modules/<modulo>` como un paquete Composer local con su propio `ServiceProvider`, rutas, migraciones, vistas, traducciones y tests.
* **DDD** protege la lógica de negocio (precios, reglas de stock, estados de pedido, publicaciones, cálculos de envío/descuentos) de los detalles de infraestructura (Eloquent, pasarelas de pago, almacenamiento S3/R2, WhatsApp, Inertia/Blade/API).
* **Escalabilidad limpia:** Puedes lanzar **Tejidos Yolis** con solo los módulos de Fase 1 activos y luego incorporar `Cart`, `Orders`, `Payments`, `Shipping`, `Promotions` sin reescribir `Catalog`.

### 5.2 Mapa de Bounded Contexts (Módulos)

```text
app-modules/
├── shared/          # [Fase 1] Kernel compartido: Value Objects, Contracts, Domain Events base
├── identity/        # [Fase 1] Usuarios, Auth, Roles/Permisos (Admin/Staff/Customer), Perfil
├── storefront/      # [Fase 1] Configuración de tienda, Branding, Páginas (Home, Nosotros, Contacto), SEO
├── catalog/         # [Fase 1] Productos, Categorías, Media/Imágenes, Variantes (futuro), Slugs
├── sales-channels/  # [Fase 1] Canal de venta asistida por WhatsApp (luego convive con Checkout)
│
├── inventory/       # [Fase 2] Kardex/Movimientos de stock, reservas temporales, alertas bajo stock
├── cart/            # [Fase 2] Carrito de compras (invitado + autenticado), merge al hacer login
├── customers/       # [Fase 2] Perfil de cliente, libreta de direcciones (Dpto/Municipio CO), wishlist
├── orders/          # [Fase 2] Pedidos, máquina de estados, snapshots de ítems, pedidos bajo encargo
├── payments/        # [Fase 2] Pasarelas (Wompi, Mercado Pago, transferencia/Nequi, contraentrega)
├── shipping/        # [Fase 2] Zonas/tarifas Colombia, recogida en taller, guías de envío
│
├── promotions/      # [Fase 3] Cupones, descuentos por categoría/producto, campañas
└── notifications/   # [Fase 3] Emails transaccionales, notificaciones WhatsApp/SMS
```

### 5.3 Reglas de Frontera entre Módulos (Crucial en Monolito Modular)
1. **Prohibido importar modelos Eloquent de otro módulo.** Por ejemplo, `Orders` nunca hace `use Modules\Catalog\Infrastructure\Persistence\Eloquent\ProductModel;`.
2. **Comunicación síncrona (Lecturas / Comandos):** Solo a través de **Contratos (Interfaces) y DTOs inmutables** expuestos por la capa `Application` o `Contracts` del módulo proveedor (ej. `CatalogGatewayInterface::findPurchasableProduct(string $productId): ?PurchasableProductDTO`).
3. **Comunicación asíncrona (Reacciones entre dominios):** Mediante **Eventos de Dominio / Integración** despachados por Laravel Events & Queues (ej. `OrderPaid` → `Inventory` descuenta stock definitivo, `Notifications` envía recibo, `Cart` vacía el carrito).
4. **Base de datos lógica separada por prefijo o responsabilidad:** Aunque compartan la misma instancia PostgreSQL/MySQL, cada módulo es **dueño exclusivo de sus migraciones y tablas**. Las referencias entre módulos se hacen por UUID (evitando FKs rígidas entre bounded contexts cuando compliquen el desacoplamiento, o manteniéndolas estrictamente controladas dentro del mismo módulo).
5. **Verificación automática:** Configurar **Pest Architecture Tests** para asegurar que `Domain` no dependa de `Illuminate\*` (ni Eloquent) y que los módulos no violen fronteras.

---

## 6. Diseño de Módulos (Bounded Contexts) y Estructura Interna DDD

Cada módulo bajo `app-modules/<modulo>/` sigue esta estructura canónica de DDD compatible con `internachi/modular`:

```text
app-modules/catalog/
├── composer.json
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── resources/
│   └── views/                     # Si usas Blade/Livewire (o componentes frontend si usas Inertia)
├── routes/
│   ├── web.php                    # Rutas públicas del módulo (Storefront)
│   └── admin.php                  # Rutas del panel administrativo (prefijo /admin)
├── src/
│   ├── Domain/
│   │   ├── Entities/              # Product, Category (Agregados / Entidades ricas)
│   │   ├── ValueObjects/          # ProductId, Slug, Money, StockQuantity, ImagePath
│   │   ├── Events/                # ProductPublished, ProductDeleted, CategoryDeleted
│   │   ├── Exceptions/            # DuplicateSlugException, InsufficientStockException
│   │   └── Repositories/          # ProductRepositoryInterface, CategoryRepositoryInterface
│   ├── Application/
│   │   ├── Actions/               # CreateProductAction, UpdateProductAction, DeleteProductAction, ...
│   │   ├── Queries/               # ListPublishedProductsQuery, GetFeaturedProductsQuery, ...
│   │   ├── DTOs/                  # ProductData, CreateProductDTO, PublicProductCardDTO
│   │   └── Contracts/             # CatalogReadContract (API pública para otros módulos)
│   ├── Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── Eloquent/          # ProductModel, CategoryModel
│   │   │   └── Repositories/      # EloquentProductRepository, EloquentCategoryRepository
│   │   ├── Media/                 # ProductImageStorageAdapter (WebP + rollback seguro)
│   │   └── Providers/
│   │       └── CatalogServiceProvider.php
│   └── Presentation/              # (o Http/)
│       ├── Http/
│       │   ├── Controllers/
│       │   │   ├── Storefront/    # ProductCatalogController, ProductDetailController
│       │   │   └── Admin/         # AdminProductController, AdminCategoryController
│       │   ├── Requests/          # StoreProductRequest, UpdateProductRequest
│       │   └── Resources/         # ProductResource
└── tests/
    ├── Unit/Domain/               # Tests puros de ValueObjects y Entidades (sin BD)
    └── Feature/                   # Tests HTTP / Actions / Persistencia
```

---

### Detalle de los Módulos de Fase 1 (Paridad 100% con Tejidos Yolis)

#### 1. Módulo `Shared` (`app-modules/shared`)
* **Value Objects reutilizables:**
  * `Money`: almacena monto en unidad mínima entera (ej. centavos o pesos enteros COP según decisión — **recomendación:** usar enteros en unidad mínima con moneda ISO `COP`, o `int $amount` + `Currency::COP` para evitar errores de punto flotante) + formateador `es-CO` (`$150.000`).
  * `Slug`: encapsula exactamente la normalización Unicode (sin tildes, minúsculas, guiones) e invariantes de formato.
  * `Uuid` / `EntityId` base.
  * `PhoneNumber` / `WhatsAppNumber`: sanitización a solo dígitos (`573143817069`).
* **Infraestructura común:**
  * `DomainEventInterface`, `EventBusInterface`.
  * `ImageProcessorInterface` (conversión a WebP, max `1600px`, calidad `82%`).

#### 2. Módulo `Identity` (`app-modules/identity`)
* **Responsabilidad:** Autenticación, autorización y gestión de cuentas.
* **Evolución respecto a Supabase:**
  * Mantiene el flujo de login administrativo (`/admin/login`) y cierre de sesión.
  * Implementa **Roles** desde el inicio (`UserRole` enum: `Admin`, `Staff`, `Customer`) para que en Fase 2 los clientes puedan registrarse sin tener jamás acceso a `/admin`.
  * Incluye la sección **Configuración de cuenta** (`/admin/configuracion`):
    * `UpdateProfileAction` (`display_name`, max 60 caracteres).
    * `RequestEmailChangeAction` (verifica `current_password`, envía correo de verificación con URL firmada de Laravel y toast de confirmación al retornar).
    * `ChangePasswordAction` (verifica `current_password`, valida nueva contraseña y confirmación).
  * **Laravel 13 Policies & Gates:** Reemplazan las políticas RLS de Supabase de forma explícita y testeable.

#### 3. Módulo `Storefront` (`app-modules/storefront`)
* **Responsabilidad:** Identidad de la tienda, configuración general (reemplaza `site.config.js`), páginas editoriales y SEO.
* **Entidades / Configuración (`store_settings` en BD con caché):**
  * `store_name` (`Tejidos Yolis`)
  * `tagline`, `seo_title`, `seo_description`, `seo_keywords`, `og_image_path`
  * `social_links` (JSON o tabla dedicada: `whatsapp`, `instagram`, `facebook`, `tiktok`, `x` + normalizador `ResolveSocialUrlService` equivalente a `src/lib/social-links.js`)
  * `location` (`name`: `El Espino, Boyacá`, `map_embed_url`, dirección estructurada para JSON-LD `PostalAddress`)
  * `about_content` (pilares y biografía de Yolanda Rojas, inicialmente seeded para Tejidos Yolis y editable desde Admin en el futuro).
* **Rutas:** `/`, `/nosotros`, `/contacto`.
* **Composición de Home:** Consulta al módulo `Catalog` vía `CatalogReadContract::getFeaturedProducts(limit: 4)`.

#### 4. Módulo `Catalog` (`app-modules/catalog`)
* **Responsabilidad:** Ciclo de vida de productos, categorías e imágenes del catálogo.
* **Agregados y Reglas de Dominio:**
  * **`Product` (Aggregate Root):**
    * Invariantes: precio `>= 0`, stock `>= 0`, slug único no vacío, estado `Draft | Published` (`is_published`).
    * Métodos de dominio: `publish()`, `unpublish()`, `isAvailable(): bool` (`stock > 0`), `updatePricing()`, `assignCategory(?CategoryId)`, `replacePrimaryImage(?ImagePath)`.
  * **`Category` (Entity):**
    * Invariantes: nombre no vacío, slug único.
    * Caso de uso `DeleteCategoryAction`: verifica cantidad de productos asociados (`CountProductsByCategoryQuery`) para la advertencia en UI y desvincula (`category_id = null`) antes de borrar.
* **Gestión de Imágenes (Transaccional y sin huérfanos):**
  * `SaveProductAction` coordina: optimización WebP (`1600px`, `q=82`) → subida a disk `products` (local/S3/Cloudflare R2) → transacción DB → si éxito, encola/elimina imagen previa; si excepción en DB, elimina la imagen recién subida en el bloque `catch`.
* **Mejora inmediata sobre la versión actual:**
  * Soportar desde el esquema múltiples imágenes por producto (`product_images` con `is_primary` y `sort_order`), manteniendo en la UI inicial de Fase 1 una carga simple (1 imagen principal o galería opcional).
  * Agregar filtros por categoría, búsqueda por nombre y paginación en `/productos`.

#### 5. Módulo `SalesChannels` (`app-modules/sales-channels`)
* **Responsabilidad:** Encapsular la lógica de venta asistida por WhatsApp (hoy en `src/lib/whatsapp.js`) para que no contamine el módulo `Catalog`.
* **Servicios:**
  * `BuildWhatsAppPurchaseLink`: recibe `ProductSummaryDTO`, `productUrl` y la configuración de WhatsApp de `Storefront`, generando exactamente:
    ```text
    https://wa.me/573143817069?text=...
    ```
    con el mensaje:
    ```text
    Hola, quiero comprar *{name}*
    {formattedPrice}
    {productUrl}
    ```
  * *Escalabilidad:* En Fase 2, el botón "Comprar por WhatsApp" puede convivir junto a "Agregar al carrito" (o servir para pedidos a medida / consultas de ruanas artesanales) y también permitir **"Enviar carrito por WhatsApp"** como checkout asistido mientras se activan pagos online.

---

### Resumen de Módulos de Fase 2 y 3 (Escalabilidad a E-commerce Robusto)

| Módulo | Responsabilidad principal | Consideraciones específicas para Tejidos Yolis / Colombia |
| :--- | :--- | :--- |
| **`Inventory`** | Movimientos de stock (`in`, `out`, `reservation`, `release`, `adjustment`), stock disponible vs. reservado. | Las ruanas artesanales suelen ser **piezas únicas (stock = 1)** o lotes pequeños; las reservas temporales en checkout evitan doble venta. |
| **`Catalog` (v2)** | Variantes (`product_variants` con atributos: color, talla, tipo de lana/tejido, SKU, precio/stock propio). | Permite pasar de "1 producto = 1 prenda" a modelos con múltiples colores o medidas sin romper URLs existentes. |
| **`Cart`** | Carrito persistente por sesión (invitados) y por usuario (logueados), con validación en tiempo real de stock/precio. | Permite checkout como invitado o usuario registrado. |
| **`Orders`** | Agregado `Order` con máquina de estados (`pending_payment`, `paid`, `in_production`, `shipped`, `delivered`, `cancelled`, `refunded`) y snapshot inmutable de nombre/precio/imagen en `order_items`. | Incluir soporte para estado **`in_production` (en telar / bajo pedido)** para ruanas hechas por encargo. |
| **`Payments`** | Abstracción `PaymentGatewayInterface` con webhooks idempotentes y registro en `payment_transactions`. | Drivers prioritarios para Colombia: **Wompi (Bancolombia/Nequi/PSE/Tarjetas)**, **Mercado Pago**, **Transferencia manual (Nequi/Daviplata/Bancolombia con comprobante)** y **Contraentrega**. |
| **`Shipping`** | Cálculo de tarifas por departamento/municipio (DIVIPOLA Colombia), envío gratis por monto mínimo, tracking de guía. | Incluir método **"Recoger en taller (El Espino, Boyacá)"** con costo `$0`. |
| **`Customers`** | Perfil de cliente, direcciones guardadas, historial de pedidos, lista de deseos. | Separado de `Identity` (que solo maneja autenticación/credenciales). |
| **`Promotions`** | Cupones (`percentage`, `fixed`), vigencias, límites de uso, descuentos por categoría. | Campañas (Día de la Madre, Navidad, ferias artesanales). |
| **`Notifications`** | Listeners de eventos de dominio para correos transaccionales y alertas al admin cuando entra un pedido o hay bajo stock. | Procesado por Laravel Queues (Redis/Database). |

---

## 7. Mapeo de Migración: Actual → Laravel 13 DDD

| Elemento actual (`tejidos-yolis`) | Destino en Laravel 13 (InterNACHI Modular + DDD) |
| :--- | :--- |
| `src/site.config.js` | Módulo `Storefront` → tabla `store_settings` + `TejidosYolisSeeder` + caché |
| `index.html` (SEO, OG, JSON-LD) | Layout principal de `Storefront` + componente `<x-seo-meta>` dinámico (SSR real) |
| `src/router/router.js` | Rutas nativas de Laravel por módulo (`routes/web.php`, `routes/admin.php`) |
| `src/lib/supabase.js` | Eliminado — reemplazado por Laravel Eloquent/DB + Repositories DDD |
| `src/lib/auth.js` + RLS | Módulo `Identity` + Laravel Auth + Middleware `auth` + Policies/Gates por rol |
| `src/lib/products.js` | Módulo `Catalog` → `Application/Queries/` (`ListPublishedProductsQuery`, `GetFeaturedProductsQuery`, `GetProductBySlugQuery`) |
| `src/lib/adminProducts.js` | Módulo `Catalog` → `Application/Actions/` (`CreateProductAction`, `UpdateProductAction`, `DeleteProductAction`) |
| `src/lib/adminCategories.js` | Módulo `Catalog` → `Application/Actions/` + `CountProductsByCategoryQuery` |
| `src/lib/images.js` & `image-optimize.js` | Módulo `Catalog` → `Infrastructure/Media/` (Laravel Filesystem S3/R2/Public + WebP 1600px q=82) |
| `src/lib/whatsapp.js` | Módulo `SalesChannels` → `BuildWhatsAppPurchaseLink` |
| `src/lib/social-links.js` | Módulo `Storefront` → `ResolveSocialUrlService` |
| `src/lib/format.js` | Módulo `Shared` → `Money` Value Object (`format('es_CO')`) |
| `src/lib/slug.js` | Módulo `Shared` → `Slug` Value Object (`Str::slug()` + invariantes) |
| `src/lib/theme.js` + script en `<head>` | Se mantiene en layout base (Tailwind v4 `@custom-variant dark` + script anti-FOUC con key configurable) |
| `src/lib/modal.js` & `toast.js` | Componentes UI reutilizables (Blade/Alpine, Livewire o Inertia/Vue/React según el stack frontend de tu boilerplate) |
| `src/assets/tejidos-yolis-oveja-logo.svg` | Componente de marca inline (ej. `<x-brand-logo />`) en `Storefront` preservando `.dark` y animaciones CSS |

---

## 8. Evolución del Modelo de Datos (Fase 1 Paridad → Fase 2/3 E-commerce)

### 8.1 Tablas Fase 1 (Paridad + Preparación)

Se recomienda mantener **UUIDv7** (`$table->uuid('id')->primary()` con `HasUuids` o `Str::uuid7()`) en todas las entidades de dominio para compatibilidad directa con los UUIDs existentes en Supabase y mejor rendimiento de índices B-Tree.

#### `identity`
* `users`: `id (uuid)`, `name (display_name, max 60)`, `email (unique)`, `email_verified_at`, `pending_email (nullable)`, `password`, `role (enum: admin, staff, customer)`, `remember_token`, `timestamps`.

#### `storefront`
* `store_settings`: `id (uuid)`, `key (unique)`, `value (jsonb)`, `timestamps` *(o tabla singleton tipada con `store_name`, `tagline`, `whatsapp_number`, `social_links`, `location_name`, `map_embed_url`, `seo_meta`, `about_content`)*.

#### `catalog`
* `categories`: `id (uuid)`, `parent_id (uuid, nullable, self-FK para subcategorías futuras)`, `name`, `slug (unique)`, `description (nullable)`, `sort_order (int default 0)`, `timestamps`.
* `products`:
  * `id (uuid)`
  * `category_id (uuid, nullable, FK → categories ON DELETE SET NULL)`
  * `name`, `slug (unique)`, `description (text, nullable)`
  * `price_amount (bigint unsigned)` *(monto en COP; si manejas decimales, almacenar centavos o `decimal(12,2)` igual que hoy)*
  * `compare_at_price_amount (bigint unsigned, nullable)` *(preparado para descuentos/precio tachado)*
  * `currency (char(3) default 'COP')`
  * `sku (string, nullable, unique)` *(opcional en Fase 1, clave para Fase 2)*
  * `stock (integer unsigned default 0)`
  * `is_published (boolean default false)` *(índice parcial o compuesto `(is_published, created_at)`)*
  * `is_featured (boolean default false)` *(opcional; si no hay destacados explícitos, fallback a los 4 últimos publicados como hoy)*
  * `made_to_order (boolean default false)` *(útil para ruanas tejidas bajo pedido)*
  * `image_path (string, nullable)` *(o relación directa con `product_images`)*
  * `timestamps`, `softDeletes` *(recomendado en e-commerce para no romper referencias históricas de pedidos cuando se "elimina" un producto)*.
* `product_images` *(recomendado desde Fase 1 para no hacer migración traumática luego)*:
  * `id (uuid)`, `product_id (uuid FK cascade)`, `path (string)`, `alt_text (string, nullable)`, `position (int default 0)`, `is_primary (boolean default false)`, `timestamps`.

### 8.2 Tablas Fase 2 (E-commerce Completo)
* **`catalog`:** `product_attributes`, `product_attribute_values`, `product_variants`, `product_variant_values`.
* **`inventory`:** `stock_movements` (`product_id`/`variant_id`, `type`, `quantity_delta`, `reference_type`, `reference_id`, `reason`, `created_by`), `stock_reservations` (`expires_at`).
* **`customers`:** `customer_profiles`, `customer_addresses` (departamento, municipio, dirección, barrio, teléfono, notas de entrega).
* **`cart`:** `carts` (`id`, `user_id nullable`, `session_id`, `expires_at`), `cart_items` (`cart_id`, `product_id`, `variant_id nullable`, `quantity`).
* **`orders`:** `orders` (`id`, `order_number` ej. `TY-2026-0001`, `customer_id nullable`, `customer_snapshot jsonb`, `shipping_address jsonb`, `status`, `subtotal`, `shipping_cost`, `discount_total`, `total`, `currency`, `channel` (`web` | `whatsapp`), `notes`), `order_items` (`product_id`, `variant_id`, `product_name_snapshot`, `sku_snapshot`, `image_snapshot`, `unit_price`, `quantity`, `line_total`), `order_status_history`.
* **`payments`:** `payment_transactions` (`order_id`, `provider`, `provider_reference`, `status`, `amount`, `currency`, `payload jsonb`, `paid_at`).
* **`shipping`:** `shipping_zones`, `shipping_rates`, `shipments` (`order_id`, `carrier`, `tracking_number`, `status`, `shipped_at`, `delivered_at`).

---

## 9. Plan de Migración de Datos y Assets desde Supabase

Cuando el nuevo proyecto en Laravel 13 tenga listos los módulos de Fase 1, sigue este procedimiento para migrar los datos existentes sin pérdida:

### 9.1 Exportación desde Supabase
1. **Base de datos (`categories` y `products`):**
   * Exportar en CSV o JSON (o `pg_dump --data-only --table=public.categories --table=public.products`) desde Supabase Dashboard o Supabase CLI.
   * Conservar los mismos **`id` (UUID)** y **`slug`** para no romper enlaces previamente compartidos en WhatsApp o Instagram (ej. `/productos/ruana-boyacense-...`).
2. **Storage (`product-images`):**
   * Descargar todos los objetos del bucket `product-images` conservando exactamente los nombres de archivo (`{uuid}.webp`).
3. **Usuarios Admin:**
   * No migrar hashes de `auth.users` de Supabase; crear la cuenta de Yolanda / admin mediante un comando Artisan o Seeder seguro con contraseña nueva y rol `admin`.

### 9.2 Importación en Laravel 13
1. Subir los archivos descargados de `product-images` al disco configurado en Laravel (`Storage::disk('products')` — S3, Cloudflare R2 o `public/storage/products`).
2. Ejecutar un comando Artisan idempotente (ej. `php artisan catalog:import-legacy-supabase --path=storage/app/legacy/`):
   * Inserta `categories` respetando `id`, `name`, `slug`, `created_at`.
   * Inserta `products` respetando `id`, `name`, `slug`, `description`, `price`, `stock`, `category_id`, `is_published`, `created_at`, `updated_at`.
   * Crea el registro en `product_images` (`is_primary = true`, `path = image_path`).
3. Ejecutar `TejidosYolisStorefrontSeeder` para poblar `store_settings` con todo el contenido de la Sección 2 de este documento.
4. Verificar que todas las URLs antiguas `/productos/{slug}` respondan `200 OK` y que las imágenes carguen correctamente.

---

## 10. Lineamientos de UI/UX y Frontend a Conservar

Independientemente de si tu boilerplate de Laravel 13 utiliza **Blade + Alpine/Livewire** o **Inertia (Vue/React)**, conserva estas decisiones de diseño que ya funcionan muy bien en Tejidos Yolis:

* **Sistema visual minimalista y artesanal:**
  * Paleta neutral de alto contraste (`bg-white text-neutral-900` en claro; `bg-neutral-950 text-neutral-100` en oscuro) para que las texturas y colores de las ruanas sean protagonistas.
  * Acentos semánticos únicamente: verde (`green-600` / `#25D366`) para disponibilidad y WhatsApp; rojo (`red-600`) para errores y acciones destructivas.
  * Bordes redondeados generosos (`rounded-2xl` en tarjetas, `rounded-lg` en botones e inputs).
* **Modo Oscuro sin parpadeo (Anti-FOUC):**
  * Mantener estrategia por clase `.dark` en `<html>` (`@custom-variant dark (&:where(.dark, .dark *));` en Tailwind v4).
  * Incluir el pequeño `<script>` bloqueante en `<head>` antes del render para leer `localStorage` con fallback a `prefers-color-scheme: dark`.
  * Asegurar que el isotipo SVG de la oveja mantenga sus variables `.dark .tejidos-logo`.
* **Experiencia Mobile-First (crítico para el público y para la administración desde celular):**
  * Header sticky con blur (`bg-white/80 backdrop-blur`) y menú colapsable en móvil.
  * Panel admin con sidebar fijo en desktop (`lg:pl-64`) y drawer off-canvas en móvil con cierre por overlay y tecla `Escape` (recordar `overflow-x: hidden` en `html, body`).
  * Listado de productos admin: **tabla en desktop (`md+`) y tarjetas compactas en móvil (`< md`)**.
  * Grid de productos en storefront: `grid-cols-2` en móvil, `sm:grid-cols-3`, `lg:grid-cols-4`.
* **Feedback y Resiliencia:**
  * Estados explícitos para carga (skeletons), vacío (empty state con CTA) y error.
  * Toasts no intrusivos (`3s`) para confirmaciones de CRUD.
  * Modal de confirmación destructiva antes de eliminar productos o categorías (mostrando conteo de productos afectados en categorías).

---

## 11. Hoja de Ruta por Fases (Roadmap Accionable)

### Fase 0 — Preparación en el Boilerplate Laravel 13
- [ ] Verificar configuración de `internachi/modular` en `composer.json` y autoloading `Modules\*`.
- [ ] Configurar Pest + Architecture Tests para reglas DDD (aislamiento de `Domain` y fronteras entre módulos).
- [ ] Configurar disco de archivos (`products`) y procesamiento de imágenes WebP (`max 1600px`, `quality 82`).
- [ ] Configurar Tailwind CSS v4 + estrategia de Dark Mode sin FOUC + Lucide Icons + Simple Icons.

### Fase 1 — Paridad Completa de Tejidos Yolis (MVP en Producción)
- [ ] **Módulo `Shared`:** Value Objects (`Money`, `Slug`, `PhoneNumber`), contratos base de eventos e imágenes.
- [ ] **Módulo `Identity`:** Login `/admin/login`, roles (`admin`, `staff`, `customer`), Policies, `/admin/configuracion` (perfil, cambio de correo con verificación y re-autenticación, cambio de contraseña).
- [ ] **Módulo `Storefront`:** `store_settings`, `TejidosYolisStorefrontSeeder`, componente inline del logo oveja animado, layout con SEO/OG/JSON-LD (`ClothingStore`), páginas `/`, `/nosotros`, `/contacto`.
- [ ] **Módulo `Catalog`:** Migraciones (`categories`, `products`, `product_images`), entidades y acciones DDD, CRUD admin de productos y categorías (con conteo previo al eliminar categoría y limpieza transaccional de imágenes), vistas `/productos` (con filtro por categoría y búsqueda) y `/productos/{slug}` (con JSON-LD `Product`).
- [ ] **Módulo `SalesChannels`:** Botón `Comprar por WhatsApp` con mensaje exacto y validación de stock/configuración.
- [ ] **Migración de datos:** Importar categorías, productos e imágenes desde Supabase y validar URLs.
- [ ] **Deploy:** Reemplazar GitHub Pages por el despliegue del proyecto Laravel 13 con dominio personalizado y HTTPS.

### Fase 2 — Transición a E-commerce Transaccional
- [ ] **Módulo `Catalog` v2:** Galería multi-imagen en admin/detalle + variantes (color, talla, tejido) + productos "bajo pedido".
- [ ] **Módulo `Inventory`:** Kardex de movimientos de stock + reservas temporales durante el checkout.
- [ ] **Módulo `Customers`:** Registro/login de compradores, libreta de direcciones (departamentos/municipios de Colombia) e historial de compras.
- [ ] **Módulo `Cart`:** Carrito persistente (guest + user merge) con opción híbrida: **Checkout online** o **Enviar pedido por WhatsApp**.
- [ ] **Módulo `Orders`:** Ciclo de vida del pedido, numeración consecutiva (`TY-YYYY-NNNN`), snapshots de ítems y panel de gestión de pedidos en `/admin/pedidos`.
- [ ] **Módulo `Shipping`:** Cálculo de envío por zona + opción gratuita *Recoger en taller (El Espino, Boyacá)* + registro de guía.
- [ ] **Módulo `Payments`:** Integración inicial con **Wompi** (PSE, Nequi, tarjetas) y/o **Transferencia manual con comprobante**.

### Fase 3 — Crecimiento y Robustez Comercial
- [ ] **Módulo `Notifications`:** Correos transaccionales (confirmación de pedido, envío, cambio de estado) y alertas al admin vía Queues.
- [ ] **Módulo `Promotions`:** Cupones de descuento, precios promocionales y campañas estacionales.
- [ ] **Analytics & SEO avanzado:** Sitemap XML automático (`/sitemap.xml`), dashboard administrativo con métricas reales (ventas, pedidos pendientes, productos con bajo stock), reseñas verificadas de clientes.
- [ ] **Multi-tienda / Marca blanca (opcional):** Aprovechar `Storefront` desacoplado si en el futuro deseas replicar la plataforma para otras tiendas artesanales o marcas propias.
