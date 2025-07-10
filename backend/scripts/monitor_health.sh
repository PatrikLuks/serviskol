#!/bin/bash
# Jednoduchý monitoring health-check endpointu backendu
# Nastavte EMAIL_TO na svůj e-mail

ENDPOINT="http://localhost:3001/api/health/health"
EMAIL_TO="vas@email.cz"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$ENDPOINT")

if [ "$RESPONSE" != "200" ]; then
  echo "[ALERT] Backend health-check selhal! Odpověď: $RESPONSE" | mail -s "[Serviskol] Backend health-check selhal!" "$EMAIL_TO"
  echo "[$(date)] Health-check selhal, odeslán e-mail na $EMAIL_TO"
else
  echo "[$(date)] Health-check OK ($RESPONSE)"
fi
