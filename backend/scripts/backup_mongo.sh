#!/bin/bash
# MongoDB zálohovací skript
# Uloží zálohu do složky backups s timestampem

BACKUP_DIR="$(dirname "$0")/../backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
MONGO_URI=${MONGO_URI:-"mongodb://localhost:27017/serviskol"}

mkdir -p "$BACKUP_DIR"
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/backup_$TIMESTAMP"
echo "Záloha MongoDB dokončena: $BACKUP_DIR/backup_$TIMESTAMP"
