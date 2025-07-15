#!/bin/bash
# Spustí automatizovaný audit změn práv a incidentů
cd "$(dirname "$0")/.."
node backend/scripts/ai_audit_rights_and_incidents.js
