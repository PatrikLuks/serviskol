#!/bin/bash
# Spustí automatizovanou eskalaci kritických nerealizovaných doporučení
cd "$(dirname "$0")/.."
node backend/scripts/ai_escalate_critical_tasks.js
