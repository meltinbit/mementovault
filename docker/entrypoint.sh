#!/bin/bash
set -e

echo "Waiting for MySQL..."
until php artisan db:monitor --databases=mysql >/dev/null 2>&1; do
    sleep 1
done
echo "MySQL ready."

# Ensure storage directories exist
mkdir -p /app/storage/logs /app/storage/framework/sessions /app/storage/framework/views /app/storage/framework/cache
chmod -R 775 /app/storage /app/bootstrap/cache
chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Ensure .env file exists for artisan commands
if [ ! -f /app/.env ]; then
    touch /app/.env
fi

# Generate app key if missing
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    NEW_KEY=$(php artisan key:generate --show --no-interaction)
    echo "APP_KEY=$NEW_KEY" >> /app/.env
    export APP_KEY="$NEW_KEY"
    echo "Generated APP_KEY"
fi

# Run migrations
php artisan migrate --force --no-interaction

# Seed (only if no users exist)
php artisan tinker --execute "if(App\Models\User::count()===0){echo 'NEEDS_SEED';}" 2>/dev/null | grep -q NEEDS_SEED && {
    echo "Seeding database..."
    php artisan db:seed --class=DockerSeeder --force --no-interaction
}

# Seed templates (idempotent)
php artisan db:seed --class=CollectionDocumentTemplateSeeder --force --no-interaction

# Cache
php artisan optimize

# Storage link
php artisan storage:link 2>/dev/null || true

# Fix permissions after all artisan commands (they run as root and create files)
chown -R www-data:www-data /app/storage /app/bootstrap/cache

echo "Starting services..."
exec supervisord -c /app/docker/supervisord.conf
