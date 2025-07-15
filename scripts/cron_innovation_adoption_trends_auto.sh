#!/bin/bash
# Spustí automatizovaný AI report trendů inovací a adopce AI v týmu
cd "$(dirname "$0")/.."
node backend/scripts/ai_innovation_adoption_trends_auto.js
