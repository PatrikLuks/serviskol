# Automatizované reporty a alerty

## Týdenní report
- Spouštějte skript `backend/scripts/sendWeeklyReport.js` (např. pomocí cron):
  ```bash
  node backend/scripts/sendWeeklyReport.js
  ```
- Report obsahuje souhrn akcí za posledních 7 dní a je odeslán všem adminům.

## Alerty
- Doporučujeme rozšířit reportUtils.js o alerty (např. při poklesu aktivity, nárůstu chyb, bezpečnostních incidentech).
- Alerty lze odesílat e-mailem, push notifikací nebo zobrazit v admin dashboardu.

## Další doporučení
- Pravidelně kontrolujte logy a reporty.
- Nastavte alerty na kritické události (např. více neúspěšných přihlášení, výpadky, změny práv).
- Reporty a alerty lze rozšířit dle potřeb provozu.

---
Tento soubor aktualizujte dle zkušeností z provozu a zpětné vazby.
