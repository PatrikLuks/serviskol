#!/bin/sh
# Build skript pro Expo EAS

echo "Spouštím build pro Android (production)..."
eas build -p android --profile production

echo "Spouštím build pro iOS (production)..."
eas build -p ios --profile production

echo "Build dokončen. Zkontrolujte výstupy v EAS dashboardu."
