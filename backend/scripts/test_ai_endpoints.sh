#!/bin/bash
# Testovací skript pro ověření AI endpointů backendu Serviskol
# Před použitím nastavte správný JWT_TOKEN a případně BASE_URL

BASE_URL="http://localhost:5000/api/ai"
JWT_TOKEN="<VAŠE_JWT_TOKEN>"

# 1. Odeslání dotazu na AI chat
curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"message": "Ahoj, co umíš?"}'

echo -e "\n---\n"

# 2. Získání historie chatu
curl -X GET "$BASE_URL/history" \
  -H "Authorization: Bearer $JWT_TOKEN"

echo -e "\n---\n"

# 3. Ohodnocení odpovědi (příklad s messageId a ratingem)
curl -X POST "$BASE_URL/rate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"messageId": "<ID_Z_HISTORIE>", "rating": 5, "feedback": "Super odpověď!"}'

echo -e "\n---\n"

# Poznámka: messageId získáte z výstupu /history nebo /chat
