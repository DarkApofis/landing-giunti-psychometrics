#!/bin/sh
# Start of the version B container: render the nginx config for $PORT, cache Laravel's
# config/routes/views with the real environment, then run PHP-FPM and nginx.
set -eu

: "${PORT:=8080}"
# Public URL for canonical/OG tags and asset URLs: explicit APP_URL, else the one Render assigns.
APP_URL="${APP_URL:-${RENDER_EXTERNAL_URL:-http://localhost:${PORT}}}"
export APP_URL
if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY is not set: generate one with 'php artisan key:generate --show' and add it to the service's environment." >&2
  exit 1
fi

envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

cd /var/www/html
php artisan config:cache
php artisan route:cache
php artisan view:cache
chown -R www-data:www-data storage bootstrap/cache

php-fpm -D
exec nginx -g 'daemon off;'
