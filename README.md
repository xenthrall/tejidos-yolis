# Tejidos Yolis

Catálogo de productos artesanales, construido con Laravel e InterNACHI Modular.

- `app-modules/app`: panel contenedor para gestionar el negocio.
- `app-modules/system`: administración de usuarios.
- `app-modules/catalog`: productos, categorías, variantes, existencias, fotografías y recursos Filament.
- `app-modules/storefront`: catálogo público, búsqueda, filtros, detalle, galería y contacto.
- `app-modules/reference/finance` y `app-modules/reference/vault`: referencias técnicas inactivas, fuera del descubrimiento de módulos.

## Desarrollo

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm ci
npm run build
composer run dev
```

`php artisan db:seed` crea la categoría Ruanas sin productos de demostración. La administración del catálogo requiere un usuario administrador: `php artisan user:create --admin`.

## Módulos

Catalog y Storefront se crearon con `php artisan make:module`. Sus modelos, políticas, controlador y migración se generan con los comandos `make:` de InterNACHI y la opción `--module=catalog` o `--module=storefront`. Composer instala los módulos como paquetes locales; InterNACHI descubre sus rutas, vistas, migraciones, comandos y políticas.

Finance y Vault permanecen como dependencias de referencia con sus providers deshabilitados en `composer.json`. Sus directorios están un nivel por debajo de los módulos activos para evitar descubrir sus rutas, migraciones y comandos. Las pruebas que ya tenían se conservan y no se ejecutaron como parte de esta implementación.

## Productos y fotografías

El producto contiene información comercial, publicación y características. Cada producto tiene al menos una variante con referencia, precio COP y existencias. Una pieza única admite una sola presentación y como máximo una unidad; una pieza sin existencias puede seguir publicada como Vendida. Los productos con variantes admiten distintas presentaciones, opciones, precios y cantidades.

La primera fotografía de la galería es la portada. Las imágenes pueden ordenarse, describirse y asociarse a variantes ya guardadas. Las fotos JPEG, PNG y WebP se guardan con nombres generados; con GD y soporte WebP se generan versiones optimizadas y miniaturas. Sin GD se conserva la imagen subida y se utiliza como respaldo. Docker incluye GD con soporte JPEG y WebP.

`CATALOG_DISK` selecciona el disco (por defecto `public`; también puede usarse el disco existente `r2_public`). Con almacenamiento local, ejecuta `php artisan storage:link`. `STORE_WHATSAPP` configura el contacto del catálogo.

El catálogo público está en `/productos`, la gestión de productos en `/app/productos` y las categorías en `/app/categorias`. Solo se muestran públicamente productos publicados con presentaciones activas y categoría visible. Los productos archivados y borradores quedan fuera de la tienda.

Carrito, pagos, pedidos y registro público de clientes quedan para una siguiente etapa.

## Producción

La guía de [despliegue con Docker, Cloudflare Tunnel y respaldos privados en R2](docs/produccion-docker.md) explica la configuración del servidor, los volúmenes persistentes y la recuperación de datos. Docker publica únicamente `127.0.0.1:18473`. La guía describe cómo crear el enlace de almacenamiento para los contenedores.
