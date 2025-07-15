#!/bin/bash
# Spustí automatizovaný workflow pro týmový knowledge base report
cd "$(dirname "$0")/.."
node backend/scripts/cron_team_knowledge_base_report.js
