# Tejidos Yolis

Base Laravel para el catálogo de ruanas del negocio.

- `app-modules/app`: panel para la futura gestión del catálogo.
- `app-modules/system`: administración de usuarios de la aplicación.
- `app-modules/finance` y `app-modules/vault`: código conservado únicamente como referencia técnica, fuera del panel y de la suite activa de pruebas.
- `resources`: página pública provisional y entradas CSS/JS mínimas. Los temas originales de App y System permanecen en `resources/css/filament`.

## Desarrollo

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm ci
npm run build
composer run dev
```

El registro permanece cerrado por defecto (`APP_INSTANCE=self-hosted`). Usa `php artisan user:create --admin` para crear el administrador.

## Módulos de referencia

`composer.json` deshabilita el descubrimiento de `tequia/finance`, `tequia/vault` e `internachi/modular`. Se conserva Modular como dependencia, pero su descubrimiento automático de rutas, vistas, comandos y migraciones está apagado para no activar los módulos de referencia. El provider principal registra las vistas y el comando de usuarios sin modificar los módulos App y System. Las migraciones existentes en Finance y Vault no se ejecutan mediante `php artisan migrate`.

El JavaScript de Vault se conserva en `app-modules/vault/resources/js/vault.js` y queda fuera de Vite. Sus dependencias permanecen instaladas como parte de esta primera limpieza.

## Validación

```sh
php artisan test --compact
npm run build
```

Las pruebas de Finance y Vault se conservan junto a su código; no se incluyen en la suite activa mientras los módulos estén deshabilitados.
