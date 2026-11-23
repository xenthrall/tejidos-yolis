# Producción: Docker, Cloudflare Tunnel y respaldos R2

La instalación sirve el catálogo y el panel en un mismo dominio HTTPS. El único puerto publicado es **127.0.0.1:18473**; `cloudflared`, instalado en el servidor, conecta ese puerto con Cloudflare. PostgreSQL y PHP-FPM no publican puertos al host.

```text
Internet → Cloudflare HTTPS → cloudflared en el servidor
                             → http://127.0.0.1:18473 → Nginx → Laravel / PostgreSQL
```

El registro público está deshabilitado. `/app/login` permite entrar a los miembros del equipo que ya tengan una cuenta. No hay modos `hosted` ni `self-hosted`.

## 1. Preparar el servidor

Requisitos: Linux, Docker Engine con Docker Compose v2 o superior, Git, un dominio administrado en Cloudflare y un bucket R2 privado. Ejecuta los comandos de Docker desde la raíz del repositorio. La imagen instala las dependencias PHP. El Dockerfile original usa los recursos de `public/build` incluidos en el repositorio; no compila Vite. Si cambias el frontend, ejecuta `composer install`, `npm ci` y `npm run build` antes de construir Docker, en una máquina con PHP/Composer y Node 22.12 o superior.

En un checkout dedicado a producción:

```sh
cp .env.docker.example .env
chmod 600 .env
```

Edita `.env` antes de iniciar:

| Variable | Valor de producción |
| --- | --- |
| `APP_URL` | Dominio definitivo, por ejemplo `https://catalogo.tudominio.com`, sin `/` final |
| Puerto | Fijo en `docker-compose.yml`: `127.0.0.1:18473:80` |
| `APP_ENV` / `APP_DEBUG` | `production` / `false` |
| `DB_CONNECTION` / `DB_HOST` | `pgsql` / `postgres` |
| `DB_DATABASE` / `DB_USERNAME` | Los nombres que quieras usar al inicializar PostgreSQL |
| `DB_PASSWORD` | Contraseña larga, única y obligatoria |
| `SESSION_SECURE_COOKIE` | `true`; inicia sesión usando el dominio HTTPS |
| `CATALOG_DISK` | `public`: fotografías en el volumen persistente |
| `STORE_WHATSAPP` | Número internacional, solo dígitos |

Las variables llegan por `env_file` y el `.env` se monta en los contenedores PHP, como en tu configuración original. El `.dockerignore` excluye ese archivo de las imágenes. Usa comillas simples para contraseñas que contengan `$` o `#` en `.env`. No publiques ni versiones ese archivo.

Antes de construir, prepara el enlace público **relativo** en el checkout del servidor:

```sh
mkdir -p storage/app/public storage/app/private storage/app/backup-temp
if [ -L public/storage ]; then unlink public/storage; fi
ln -s ../storage/app/public public/storage
```

Si `public/storage` es un directorio real, revisa su contenido antes de sustituirlo; el comando no lo borra. Construye desde un checkout limpio de producción, sin credenciales adicionales ni copias privadas dentro del contexto de construcción.

Construye las imágenes:

```sh
docker compose build
```

Genera la clave de Laravel sin arrancar servicios ni ejecutar el entrypoint:

```sh
docker compose run --rm --no-deps --entrypoint php app artisan key:generate --show --no-interaction
```

Copia el resultado `base64:...` a `APP_KEY` en `.env`. **Conserva esa misma clave en futuras actualizaciones y restauraciones.** Guarda una copia segura de `.env` fuera del servidor: el respaldo automático no incluye credenciales ni la clave de Laravel.

## 2. Arrancar y crear el administrador

```sh
docker compose up -d
docker compose ps -a
docker compose logs --tail=100 app nginx scheduler
```

Se conservan los servicios originales `app`, `nginx`, `postgres`, `queue` y `scheduler`. No hay servicios adicionales ni migraciones automáticas. Ejecuta las migraciones y prepara los permisos:

```sh
docker compose exec app php artisan migrate --force
docker compose exec --user root app sh -c 'mkdir -p storage/app/public storage/app/private storage/app/backup-temp; chown -R www-data:www-data storage; chmod 755 storage storage/app storage/app/public; chmod 700 storage/app/private storage/app/backup-temp'
```

Crea el usuario administrador mediante las preguntas de consola:

```sh
docker compose exec app php artisan user:create --admin
```

Puedes crear las categorías desde el panel. Si quieres la categoría inicial Ruanas en una instalación nueva:

```sh
docker compose exec app php artisan db:seed --force
```

Comprueba la respuesta local:

```sh
curl -I http://127.0.0.1:18473/up
```

El acceso completo al panel se hace por HTTPS una vez configurado el túnel. La cookie segura no se envía al origen HTTP local. Laravel ya confía en los encabezados del proxy para generar enlaces HTTPS y cargar imágenes sin contenido mixto.

## 3. Cloudflare Tunnel desde el host

Instala `cloudflared` siguiendo la [documentación oficial de instalación](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/). Esta guía usa un túnel administrado localmente, con credenciales en el servidor.

Ejecuta con tu usuario habitual:

```sh
cloudflared tunnel login
cloudflared tunnel create tejidos-yolis
cloudflared tunnel route dns tejidos-yolis catalogo.tudominio.com
```

Anota el UUID devuelto. Sustituye `UUID_DEL_TUNEL` y el dominio en los ejemplos siguientes. Copia las credenciales generadas:

```sh
sudo install -d -m 700 /etc/cloudflared
sudo install -m 600 "$HOME/.cloudflared/UUID_DEL_TUNEL.json" /etc/cloudflared/UUID_DEL_TUNEL.json
sudo nano /etc/cloudflared/config.yml
```

Contenido de `/etc/cloudflared/config.yml`:

```yaml
tunnel: UUID_DEL_TUNEL
credentials-file: /etc/cloudflared/UUID_DEL_TUNEL.json

ingress:
  - hostname: catalogo.tudominio.com
    service: http://127.0.0.1:18473
  - service: http_status:404
```

Valida la configuración e instala el servicio:

```sh
sudo cloudflared tunnel --config /etc/cloudflared/config.yml ingress validate
sudo cloudflared --config /etc/cloudflared/config.yml service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
```

Para diagnosticarlo:

```sh
sudo journalctl -u cloudflared -n 100 --no-pager
```

Si ya tienes un servicio `cloudflared` en ese servidor, añade la regla del dominio a su configuración existente y reinícialo, en lugar de instalar un segundo servicio con el mismo nombre.

`cloudflared` debe correr **en el host** para que `127.0.0.1` apunte al puerto publicado por Docker. Dentro de un contenedor independiente, esa dirección apuntaría al propio contenedor. No necesitas abrir el puerto 18473 hacia Internet ni publicar 80/443 en Docker. La conexión del túnel al origen usa HTTP local; Cloudflare atiende HTTPS al público.

Consulta las referencias oficiales de [creación del túnel](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/create-local-tunnel/), [archivo de configuración](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/configuration-file/) y [servicio Linux](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/as-a-service/linux/).

## 4. Fotografías, volumen y enlace público

Compose conserva dos volúmenes:

| Volumen predeterminado | Contenido |
| --- | --- |
| `tejidos-yolis_app_storage` | `storage`: fotografías, archivos privados, temporales, sesiones de archivo si se usan y logs |
| `tejidos-yolis_postgres_data` | Datos de PostgreSQL 16 |

Nginx conserva el montaje del repositorio del host en `/var/www/html` y el volumen `app_storage` en `/var/www/html/storage:ro`. PHP monta ese mismo volumen con escritura. El enlace relativo preparado antes del build es:

```text
/var/www/html/public/storage → ../storage/app/public
```

Dentro de ambos contenedores resuelve hacia `/var/www/html/storage/app/public`, donde está el volumen compartido. Un enlace absoluto creado en el host hacia `/home/usuario/proyecto/storage/app/public` no funcionaría dentro de los contenedores. Por eso debes preparar el enlace relativo antes de construir; no uses `php artisan storage:link` en el host para este despliegue.

Comprobaciones manuales después de desplegar:

```sh
docker compose exec app readlink /var/www/html/public/storage
docker compose exec nginx readlink /var/www/html/public/storage
docker compose exec nginx ls -ld /var/www/html/storage/app/public
```

Carga una fotografía desde el panel y abre su URL real `/storage/...` en el dominio HTTPS. Comprueba también que siga disponible después de recrear `app` y `nginx`. Las fotos usan nombres generados y permisos de visibilidad pública. El disco público debe contener únicamente los archivos públicos del catálogo; el directorio privado queda fuera del enlace.

`docker compose down` conserva los volúmenes. **`docker compose down -v` los elimina**, incluidas fotografías y base de datos. Los nombres dependen del nombre del proyecto Compose, normalmente el de la carpeta. Mantén ese nombre o configura `COMPOSE_PROJECT_NAME=tejidos-yolis` en `.env` para reutilizar los mismos volúmenes.

Si ya tienes fotos en otro despliegue o en `storage/app/public` del host, cópialas al volumen antes de publicar el sitio; no dependas de la copia de una imagen para conservarlas. Por ejemplo, con las imágenes construidas:

```sh
docker compose run --rm --no-deps --user root --entrypoint sh \
  -v "$PWD/storage/app/public:/import:ro" app \
  -c 'mkdir -p storage/app/public; cp -a /import/. storage/app/public/; chown -R www-data:www-data storage; chmod 755 storage storage/app storage/app/public'
```

Esto importa fotos, no convierte una base de datos SQLite existente a PostgreSQL. Una instalación nueva comienza con base vacía; la migración de datos existentes debe hacerse por separado antes del cambio definitivo.

## 5. Respaldos automáticos al bucket R2 privado

Crea un bucket dedicado sin acceso público y unas credenciales S3 de R2 limitadas a ese bucket, con permiso de lectura y escritura de objetos (también se necesita eliminar objetos para aplicar la retención). Son el Access Key ID y Secret Access Key de R2, no un token de Cloudflare Tunnel. Referencias: [credenciales de R2](https://developers.cloudflare.com/r2/api/tokens/) y [SDK PHP](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-php/).

Configura en `.env`:

```dotenv
R2_PRIVATE_ACCESS_KEY_ID=tu_access_key
R2_PRIVATE_SECRET_ACCESS_KEY=tu_secret_key
R2_PRIVATE_BUCKET=tejidos-yolis-backups
R2_PRIVATE_ENDPOINT=https://TU_ACCOUNT_ID.r2.cloudflarestorage.com
R2_DEFAULT_REGION=auto
BACKUP_ENABLED=true
BACKUP_NOTIFICATION_EMAIL=
BACKUP_WARNING_SIZE_MB=10000
BACKUP_ARCHIVE_PASSWORD=
```

Usa el endpoint S3 del panel de R2, no una URL `r2.dev`. El disco privado no configura ACL por objeto y arroja errores si no puede escribir. El bucket público opcional `r2_public` no interviene en estos respaldos.

Después de cambiar variables, **recrea los contenedores**; `restart` no recarga `env_file`:

```sh
docker compose up -d --force-recreate
```

El scheduler programa, en horario `America/Bogota`:

- 02:00: respaldo completo de la base de datos y los directorios `storage/app/public` y `storage/app/private`.
- 03:30: limpieza según la retención.
- 04:00: supervisión de antigüedad y tamaño.

Se excluyen el código, `.env`, logs, cachés, subidas temporales de Livewire y archivos temporales del propio respaldo. El ZIP se prepara en `storage/app/backup-temp`, se verifica y se sube al prefijo `tejidos-yolis-backup/` del bucket privado. Deja espacio libre en el volumen para el volcado SQL y el ZIP. El Dockerfile original instala `postgresql-client` desde la distribución base. Comprueba con `docker compose exec app pg_dump --version` que sea versión 16 o superior antes del primer respaldo: un cliente anterior no puede volcar PostgreSQL 16.

Retención: todos los respaldos durante 7 días; después uno diario durante 30 días, uno semanal durante 8 semanas, uno mensual durante 6 meses y uno anual durante 2 años. No se borran archivos por un límite fijo de tamaño. `BACKUP_WARNING_SIZE_MB` sirve para avisar, no para borrar. El monitor considera no saludable un respaldo de más de 2 días.

Para recibir alertas reales, configura SMTP en `MAIL_*`, cambia `MAIL_MAILER=log` por `smtp` y establece `BACKUP_NOTIFICATION_EMAIL`. Con correo vacío se conservan los logs pero no se envían notificaciones. Puedes cifrar los ZIP con `BACKUP_ARCHIVE_PASSWORD`; guarda esa contraseña fuera del servidor y usa una herramienta compatible con ZIP AES para restaurarlos.

Primera ejecución y comprobación manual:

```sh
docker compose exec scheduler php artisan backup:run
docker compose exec scheduler php artisan backup:list
docker compose exec scheduler php artisan backup:monitor
docker compose exec scheduler php artisan schedule:list
docker compose exec scheduler tail -n 100 storage/logs/backup.log
```

Los comandos manuales de respaldo siguen disponibles aunque `BACKUP_ENABLED=false`; esa variable habilita únicamente la programación automática. El log `backup.log` aparece al ejecutarse una tarea programada. Los errores del paquete también quedan en los logs de Laravel. Configura rotación para esos archivos si mantienes el servidor durante mucho tiempo; Docker solo rota los logs de salida de los contenedores.

Estos respaldos presuponen `CATALOG_DISK=public`. Si en el futuro guardas fotos directamente en `r2_public`, sus objetos requerirán una estrategia de respaldo aparte: la base de datos guarda sus rutas, pero este proceso no descarga el bucket público.

## 6. Actualizaciones

Antes de actualizar, confirma que tienes un respaldo recuperable. Después:

```sh
git pull
docker compose build
docker compose up -d --force-recreate
docker compose ps -a
docker compose logs --tail=100 app queue scheduler nginx
```

Después de recrear, ejecuta `docker compose exec app php artisan migrate --force`. La recreación hace que los workers reciban el código y las variables nuevos. Conserva `.env`, `APP_KEY`, el nombre del proyecto y los volúmenes. El proceso puede causar una interrupción breve; no es un despliegue sin tiempo de inactividad.

En un volumen de PostgreSQL ya inicializado, cambiar `DB_PASSWORD` en `.env` no cambia la contraseña del usuario SQL: debes cambiarla también en PostgreSQL antes de recrear los servicios. Cambiar solo `POSTGRES_*` no vuelve a inicializar la base existente.

## 7. Recuperación de un respaldo

1. Descarga un ZIP del bucket privado y extráelo en una carpeta segura. Si configuraste contraseña, usa ZIP AES. Inspecciona el contenido: encontrarás el volcado `.sql` y las fotografías bajo `storage/app/public`, además de los archivos privados que existieran.
2. Recupera el `.env` original, especialmente `APP_KEY`, y las credenciales del bucket. El ZIP no los contiene.
3. Detén los procesos que escriben y prepara una base nueva vacía para no sobrescribir la original:

   ```sh
   docker compose stop nginx app queue scheduler
   docker compose exec postgres sh -c 'createdb -U "$POSTGRES_USER" tejidos_yolis_restaurada'
   ```

4. Importa el archivo SQL real que extrajiste (ajusta `/ruta/segura/base.sql`):

   ```sh
   docker compose exec -T postgres sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d tejidos_yolis_restaurada' < /ruta/segura/base.sql
   ```

5. Copia los archivos de `storage/app` del ZIP al volumen. Con `/ruta/segura/respaldo/storage/app` como directorio extraído:

   ```sh
   docker compose run --rm --no-deps --user root --entrypoint sh \
     -v /ruta/segura/respaldo/storage/app:/restore:ro app \
     -c 'cp -a /restore/. /var/www/html/storage/app/'
   docker compose run --rm --no-deps --user root --entrypoint sh app -c 'chown -R www-data:www-data storage; chmod 755 storage storage/app storage/app/public; chmod 700 storage/app/private storage/app/backup-temp'
   ```

   La copia combina directorios y reemplaza archivos con el mismo nombre; conserva antes el volumen original o recupera en un servidor separado si necesitas un estado idéntico al del respaldo, sin archivos posteriores.

6. Cambia `DB_DATABASE=tejidos_yolis_restaurada` en `.env` y ejecuta `docker compose up -d --force-recreate`. Comprueba acceso, categorías, productos y fotos antes de publicar de nuevo. No elimines la base ni los archivos originales hasta confirmar la recuperación.

La copia conjunta de archivos y base no congela la actividad del panel. Para una copia previa a una migración importante, detén temporalmente las escrituras del equipo y de los workers durante el respaldo.

Implementación de respaldos: [Spatie Laravel Backup](https://spatie.be/docs/laravel-backup/v10/taking-backups/overview). Se conservan las [dependencias de Docker Compose](https://docs.docker.com/compose/how-tos/startup-order/).
