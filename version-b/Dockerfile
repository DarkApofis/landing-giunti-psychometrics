# syntax=docker/dockerfile:1
#
# Version B (Laravel 13 + Blade + Stylus + jQuery + Gulp) — production image for Render / Railway.
#
#   build:  docker build -t giunti-b .
#   run:    docker run -p 8080:8080 -e APP_KEY=base64:... -e APP_URL=http://localhost:8080 giunti-b
#
# Stages: PHP dependencies (Composer) · front-end build (Gulp) · runtime (nginx + PHP-FPM on Alpine).
# The runtime listens on $PORT (set by the platform; 8080 by default), serves public/ with brotli/gzip and
# immutable caching for the hashed assets, and caches config/routes/views on start (docker/entrypoint.sh).

# ── 1. PHP dependencies ───────────────────────────────────────────────────────
FROM composer:2.8 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
# --no-scripts: the app is not copied yet; package discovery runs in the runtime stage.
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist --no-scripts

# ── 2. Front-end build ────────────────────────────────────────────────────────
FROM node:24.16.0-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY gulpfile.mjs ./
COPY resources ./resources
RUN npm run build

# ── 3. Runtime ────────────────────────────────────────────────────────────────
FROM php:8.4-fpm-alpine AS runtime

RUN apk add --no-cache nginx nginx-mod-http-brotli gettext \
    && docker-php-ext-install opcache \
    && mkdir -p /run/nginx

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-production.ini
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/zz-www.conf
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

WORKDIR /var/www/html
COPY --chown=www-data:www-data . .
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
COPY --from=assets --chown=www-data:www-data /app/public/build ./public/build
COPY --from=assets --chown=www-data:www-data /app/public/fonts ./public/fonts
COPY --from=assets --chown=www-data:www-data /app/resources/svg ./resources/svg

# Package discovery (skipped by Composer above) and writable runtime directories.
RUN php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache/data storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

# Production defaults; APP_KEY, APP_URL and TRUSTED_PROXIES come from the platform.
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    LOG_LEVEL=warning \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    PORT=8080

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/up" || exit 1
ENTRYPOINT ["entrypoint"]
