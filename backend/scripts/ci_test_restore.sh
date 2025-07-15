#!/bin/sh
# CI skript: otestuje obnovu zálohy na testovací DB (disaster recovery test)
# Předpoklad: existuje záloha v backups/ a testovací MongoDB běží na localhost:27018

set -e

BACKUP_FILE=$(ls -t backups/*.gz 2>/dev/null | head -n1)
if [ -z "$BACKUP_FILE" ]; then
  echo "Žádná záloha nenalezena v backups/"
  exit 1
fi

echo "Používám zálohu: $BACKUP_FILE"

echo "Obnovuji zálohu do testovací DB (localhost:27018)..."
mongorestore --gzip --archive="$BACKUP_FILE" --nsInclude='serviskol.*' --drop --host localhost --port 27018

if [ $? -eq 0 ]; then
  echo "Obnova zálohy na testovací DB proběhla úspěšně."
else
  echo "Obnova zálohy SELHALA!"
  exit 2
fi
