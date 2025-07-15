#!/bin/sh
# CI skript: otestuje alerting systému (Prometheus, Sentry) simulací výpadku endpointu
# Předpoklad: Prometheus/Sentry běží a monitorují testovací backend

set -e

BACKEND_URL="http://localhost:3001"

# Simulace výpadku: vypneme health endpoint (např. přejmenujeme soubor)
if [ -f ./routes/healthRoutes.js ]; then
  mv ./routes/healthRoutes.js ./routes/healthRoutes.bak
  REVERT=1
fi

# Restart backendu (předpoklad: běží v docker-compose)
docker-compose restart backend
sleep 10


# Ověření, že health endpoint je nedostupný
if curl -fsSL "$BACKEND_URL/api/health/health" >/dev/null; then
  echo "Health endpoint je stále dostupný, simulace výpadku selhala."
  [ "$REVERT" = "1" ] && mv ./routes/healthRoutes.bak ./routes/healthRoutes.js
  exit 1
else
  echo "Health endpoint je nedostupný, výpadek simulován."
fi

# Ověření, že alert BackendDown je aktivní v Prometheus Alertmanageru
PROMETHEUS_ALERTS_URL="http://localhost:9093/api/v2/alerts"
echo "Čekám 60s na vygenerování alertu..."
sleep 60
ALERT_FOUND=0
if curl -fsSL "$PROMETHEUS_ALERTS_URL" | grep -q '"labels":{"alertname":"BackendDown"'; then
  echo "Alert BackendDown byl úspěšně vygenerován."
  ALERT_FOUND=1
else
  echo "Upozornění: Alert BackendDown nebyl nalezen v Prometheus Alertmanageru!"
fi

# ...existing code...

# Obnovíme health endpoint
[ "$REVERT" = "1" ] && mv ./routes/healthRoutes.bak ./routes/healthRoutes.js

docker-compose restart backend
sleep 10

echo "Test alertingu dokončen."
exit 0
