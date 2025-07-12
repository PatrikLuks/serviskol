# ServisKol – Provozní a bezpečnostní manuál

## Kontakty
- Hlavní správce: ...
- Zástupce: ...
- E-mail pro alerty: ...

## Disaster recovery (obnova ze zálohy)
1. Zastavte všechny služby: `docker-compose down`
2. Obnovte MongoDB: `sh scripts/restore_mongo.sh <cesta_k_zaloze>`
3. Spusťte služby: `docker-compose up -d --build`
4. Ověřte funkčnost aplikace a dat

## Zálohování
- Automatizováno pomocí cronu: `sh scripts/backup_mongo.sh`
- Zálohy najdete v adresáři `backups/`
- Pravidelně testujte obnovu!

## Monitoring a alerty
- Prometheus: sleduje dostupnost backendu, chyby 5xx, metriky
- Sentry: alerty na kritické chyby (nutné nastavit SENTRY_DSN)
- Audit log: `/tmp/audit.log`, denní report skriptem `scripts/auditlog_report.sh`

## Bezpečnost
- Pravidelně spouštějte `npm audit` a aktualizujte závislosti
- 2FA povinné pro adminy a techniky
- Pravidelně kontrolujte audit logy
- Ukládejte JWT do HttpOnly cookie (doporučeno pro produkci)

## Provozní úkony
- Restart služeb: `docker-compose restart`
- Update: `git pull && docker-compose up -d --build`
- Health-check: `sh scripts/health_check.sh`

## Incident response
- V případě incidentu kontaktujte správce
- Zaznamenejte čas, popis a kroky řešení
- Ověřte integritu dat a funkčnost záloh

## Důležité odkazy a skripty
- Záloha: `scripts/backup_mongo.sh`
- Obnova: `scripts/restore_mongo.sh`
- Health-check: `scripts/health_check.sh`
- Auditlog report: `scripts/auditlog_report.sh`
- Monitoring alerty: `monitoring/prometheus_alerts.yml`

---
Tento dokument pravidelně aktualizujte dle změn v infrastruktuře a týmu.
