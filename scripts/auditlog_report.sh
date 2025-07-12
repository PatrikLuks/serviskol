#!/bin/sh
# Report posledních 50 záznamů z audit logu e-mailem

LOGFILE="/tmp/audit.log"
EMAIL="spravce@vasedomena.cz"

if [ ! -f "$LOGFILE" ]; then
  echo "Audit log nenalezen: $LOGFILE"
  exit 1
fi

LAST_LOGS=$(tail -n 50 "$LOGFILE")
echo "$LAST_LOGS" | mail -s "ServisKol: Denní audit log report" "$EMAIL"
