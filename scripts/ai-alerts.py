#!/usr/bin/env python3
"""
AI skript pro sumarizaci alertů a návrhy na zlepšení provozu.
Použití: python ai-alerts.py monitoring/alerts.log
"""
import sys
from datetime import datetime

if len(sys.argv) < 2:
    print("Použití: python ai-alerts.py <cesta_k_logu>")
    sys.exit(1)

log_path = sys.argv[1]

with open(log_path, 'r') as f:
    lines = f.readlines()

critical_alerts = [l for l in lines if 'CRITICAL' in l or 'critical' in l]
warning_alerts = [l for l in lines if 'WARNING' in l or 'warning' in l]

print(f"Celkový počet alertů: {len(lines)}")
print(f"Počet kritických alertů: {len(critical_alerts)}")
print(f"Počet varování: {len(warning_alerts)}")

if critical_alerts:
    print("\nPoslední kritické alerty:")
    for l in critical_alerts[-5:]:
        print(l.strip())
    print("\nDoporučení: Okamžitě analyzujte příčinu a vyplňte post-mortem report.")
else:
    print("\nŽádné kritické alerty nebyly detekovány.")

if warning_alerts:
    print("\nDoporučení: Sledujte varování a zvažte preventivní opatření.")
else:
    print("\nSystém je stabilní.")
