#!/bin/bash
# Spustí automatizovanou AI analýzu onboarding feedbacku
cd "$(dirname "$0")/.."
node backend/scripts/ai_onboarding_feedback_analyze_auto.js
