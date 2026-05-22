#!/bin/sh
set -e

echo "[Certbot] Starting certificate auto-renewal daemon..."

# Renew certificates every 12 hours (Let's Encrypt recommends twice daily)
while :; do
    echo "[Certbot] Checking for certificate renewal..."
    certbot renew --quiet --deploy-hook "echo '[Certbot] Certificate renewed successfully.'"
    echo "[Certbot] Next renewal check in 12 hours."
    sleep 12h
done
