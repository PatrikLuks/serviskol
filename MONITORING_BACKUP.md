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
- **Doporučení:** Nastavte alerty v Sentry na kritické chyby (např. výpadky loginu, 5xx chyby, neúspěšné pokusy o přihlášení, výpadky služeb).

## MongoDB Atlas Monitoring
- Využijte vestavěný monitoring v Atlasu (https://cloud.mongodb.com/)
- Nastavte alerty na pomalé dotazy, výpadky, růst databáze.
- Pravidelně kontrolujte zálohy a využití.

## Prometheus a Grafana
- Backend nabízí endpoint `/metrics` (Prometheus format, powered by prom-client).
- Přidejte scrape config do Promethea, např.:
  ```yaml
  scrape_configs:
    - job_name: 'serviskol-backend'
      static_configs:
        - targets: ['localhost:3001']
  ```
- **Doporučení:** Nastavte alerty v Prometheus/Grafana na:
  - zvýšený počet chybových odpovědí (4xx, 5xx)
  - dlouhé odezvy API
  - výpadky endpointů (health, metrics)
  - neobvyklý nárůst požadavků (možný útok)

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

## Disaster recovery – simulace výpadku a obnova
- Pravidelně testujte obnovu záloh (např. na testovací instanci).
- Pro simulaci výpadku:
  - Zastavte MongoDB nebo backend (`docker stop <container>` nebo `systemctl stop mongod`)
  - Ověřte, že monitoring a alerty výpadek zachytí (Sentry, Prometheus, Atlas alerty)
  - Proveďte obnovu ze zálohy dle postupu výše
  - Ověřte funkčnost aplikace po obnově

## Troubleshooting monitoring a alertů
- Pokud alerty nechodí, ověřte správné nastavení webhooků/emailů v Sentry, Prometheus, Atlasu.
- Pokud Prometheus nesbírá metriky, ověřte dostupnost `/metrics` endpointu a scrape config.
- Pokud Sentry nezachytává chyby, ověřte DSN a inicializaci v kódu.
- Problémy se zálohami: ověřte logy zálohovacího procesu a dostupnost úložiště.

## Další doporučení
- Pravidelně testujte obnovu záloh.
- Nastavte Sentry alerty na kritické chyby.
- Sledujte audit logy a využití API.
- Pravidelně aktualizujte tento dokument dle provozních zkušeností.

---
Tento soubor pravidelně aktualizujte dle provozních zkušeností.
