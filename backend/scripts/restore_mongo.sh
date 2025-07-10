#!/bin/bash
# Skript pro obnovu MongoDB zálohy
# Použití: ./restore_mongo.sh <soubor_zalohy>

if [ -z "$1" ]; then
  echo "Chyba: Zadejte cestu k souboru se zálohou (.gz nebo adresář)."
  echo "Použití: $0 <soubor_zalohy>"
  exit 1
fi

BACKUP_PATH="$1"
MONGO_DB="serviskol"
MONGO_HOST="localhost"
MONGO_PORT="27017"

if [[ $BACKUP_PATH == *.gz ]]; then
  echo "Obnovuji zálohu z komprimovaného souboru $BACKUP_PATH..."
  mongorestore --gzip --archive="$BACKUP_PATH" --nsInclude "$MONGO_DB.*" --drop --host $MONGO_HOST --port $MONGO_PORT
else
  echo "Obnovuji zálohu z adresáře $BACKUP_PATH..."
  mongorestore --dir="$BACKUP_PATH" --nsInclude "$MONGO_DB.*" --drop --host $MONGO_HOST --port $MONGO_PORT
fi

echo "Obnova dokončena."
