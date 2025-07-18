#!/bin/bash
# Spustí automatizovaný export compliance reportů a audit logů do PDF
cd "$(dirname "$0")/.."
node backend/scripts/ai_compliance_export_auto.js
