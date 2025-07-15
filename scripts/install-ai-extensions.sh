#!/bin/bash
# Instalační skript pro doporučená AI rozšíření do VS Code (2025)

EXTENSIONS=(
  github.copilot
  github.copilot-chat
  codeium.codeium
  tabnine.tabnine-vscode
  continue.continue
  sourcegraph.cody-ai
  blackboxapp.blackboxagent
)

echo "Instaluji AI rozšíření do VS Code..."
for ext in "${EXTENSIONS[@]}"; do
  code --install-extension "$ext" || echo "Nelze nainstalovat $ext (možná už je nainstalováno)"
done
echo "Hotovo! Doporučuji restartovat VS Code."
