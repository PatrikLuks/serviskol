#!/bin/bash
# Spustí automatizované generování AI lessons learned & best practices reportu
cd "$(dirname "$0")/.."
node backend/scripts/ai_lessons_learned_auto.js
