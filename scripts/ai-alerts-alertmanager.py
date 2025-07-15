#!/usr/bin/env python3
"""
AI skript pro automatizovanou analýzu alertů z Prometheus Alertmanager API a generování post-mortem reportu.
Použití: python ai-alerts-alertmanager.py [URL_ALERTMANAGER_API]
"""
import sys
import requests
from datetime import datetime
import os

ALERTMANAGER_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:9093/api/v2/alerts"

try:
    resp = requests.get(ALERTMANAGER_URL, timeout=10)
    resp.raise_for_status()
    alerts = resp.json()
except Exception as e:
    print(f"Chyba při načítání alertů: {e}")
    sys.exit(1)

critical_alerts = [a for a in alerts if a.get('labels', {}).get('severity', '').lower() == 'critical']
warning_alerts = [a for a in alerts if a.get('labels', {}).get('severity', '').lower() == 'warning']

print(f"Aktivní alerty: {len(alerts)}")
print(f"Kritické alerty: {len(critical_alerts)}")
print(f"Varování: {len(warning_alerts)}")

if critical_alerts:
    print("\nPoslední kritické alerty:")
    for a in critical_alerts[-5:]:
        print(f"- {a['labels'].get('alertname')} ({a['annotations'].get('summary','')})")
    # Automatizované vygenerování post-mortem šablony
    now = datetime.now().strftime('%Y-%m-%d_%H%M')
    fname = f"postmortems/POSTMORTEM_{now}_auto.md"
    with open("postmortems/POSTMORTEM_TEMPLATE.md", "r") as t:
        template = t.read()
    with open(fname, "w") as f:
        f.write(template)
    print(f"\nVytvořen post-mortem report: {fname}")
    print("Doporučení: Vyplňte a analyzujte post-mortem report.")
else:
    print("\nŽádné kritické alerty nebyly detekovány.")

if warning_alerts:
    print("\nDoporučení: Sledujte varování a zvažte preventivní opatření.")
else:
    print("\nSystém je stabilní.")
