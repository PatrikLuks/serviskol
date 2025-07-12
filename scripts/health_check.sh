#!/bin/sh
# Health-check skript pro ServisKol

set -e

FRONTEND_URL="http://localhost:8080"
BACKEND_URL="http://localhost:3001"

# Ověření frontendu
curl -fsSL "$FRONTEND_URL" >/dev/null && echo "Frontend OK" || echo "Frontend FAIL"

# Ověření backendu
curl -fsSL "$BACKEND_URL" >/dev/null && echo "Backend OK" || echo "Backend FAIL"

# Ověření API health endpointu
curl -fsSL "$BACKEND_URL/api/health/health" >/dev/null && echo "/api/health/health OK" || echo "/api/health/health FAIL"

# Ověření Prometheus metrics
curl -fsSL "$BACKEND_URL/metrics" >/dev/null && echo "/metrics OK" || echo "/metrics FAIL"

exit 0
