#!/bin/bash
# ============================================================
# Meetix — First-Time SSL Certificate Setup
# Run this ONCE on your EC2 instance before starting the app.
# ============================================================
set -e

DOMAIN="meetixchat.online"
EMAIL="${1:?Usage: ./init-ssl.sh your-email@example.com}"

echo "============================================="
echo "  Meetix SSL Certificate Initialization"
echo "  Domain: $DOMAIN"
echo "  Email:  $EMAIL"
echo "============================================="

# 1. Create required directories
echo "[1/4] Creating directories..."
sudo mkdir -p /var/www/certbot
sudo mkdir -p /etc/letsencrypt

# 2. Create a temporary Nginx config that only serves HTTP
#    (so Certbot can verify domain ownership via ACME challenge)
echo "[2/4] Starting temporary Nginx for ACME challenge..."

docker run -d --rm \
    --name temp-nginx \
    -p 80:80 \
    -v /var/www/certbot:/var/www/certbot \
    nginx:alpine sh -c "
cat > /etc/nginx/nginx.conf << 'NGINXCONF'
events { worker_connections 64; }
http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Meetix SSL init in progress...';
            add_header Content-Type text/plain;
        }
    }
}
NGINXCONF
nginx -g 'daemon off;'
"

# Wait for Nginx to be ready
sleep 3

# 3. Request the certificate
echo "[3/4] Requesting SSL certificate from Let's Encrypt..."
docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/www/certbot:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --force-renewal

# 4. Stop temporary Nginx
echo "[4/4] Stopping temporary Nginx..."
docker stop temp-nginx 2>/dev/null || true

echo ""
echo "============================================="
echo "  SSL certificate obtained successfully!"
echo "  Certificate: /etc/letsencrypt/live/$DOMAIN/"
echo ""
echo "  Now start the full stack:"
echo "    docker compose -f docker-compose.prod.yml up -d"
echo "============================================="
