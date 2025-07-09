# Monitoring a zálohování – doporučení

## Sentry (chybový monitoring)
- Založte projekt na https://sentry.io/
- Vytvořte DSN a přidejte do `.env`:
  ```
  SENTRY_DSN=vaše_sentry_dsn
  VITE_SENTRY_DSN=vaše_sentry_dsn # pro frontend
  ```
- Sentry je již integrováno v backendu (viz `server.js`).
- Pro frontend použijte balíček `@sentry/react` a obdobnou inicializaci v `main.jsx`.

## MongoDB Atlas Monitoring
- Využijte vestavěný monitoring v Atlasu (https://cloud.mongodb.com/)
- Nastavte alerty na pomalé dotazy, výpadky, růst databáze.
- Pravidelně kontrolujte zálohy a využití.

## Zálohování databáze
- V Atlasu nastavte automatické zálohy (Snapshoty, Continuous Backup).
- Pro ruční zálohu použijte:
  ```bash
  mongodump --uri="mongodb+srv://..." --out=./backup-$(date +%F)
  ```
- Pro obnovu:
  ```bash
  mongorestore --uri="mongodb+srv://..." ./backup-YYYY-MM-DD
  ```
- Doporučujeme zálohovat i složku `uploads/` (fotky) a `logs/` (audit, feedback).

## Další doporučení
- Pravidelně testujte obnovu záloh.
- Nastavte Sentry alerty na kritické chyby.
- Sledujte audit logy a využití API.

---
Tento soubor pravidelně aktualizujte dle provozních zkušeností.
