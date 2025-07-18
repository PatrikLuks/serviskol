# Roadmapa pro odstranění hlavních slabin projektu ServisKol

## 1. Automatizace kontroly plnění doporučení
- Zajistit pravidelné spouštění AI skriptu pro kontrolu akčních kroků (cron, CI/CD)
- Eskalovat kritické nerealizované úkoly (Slack, e-mail)
- Logovat výsledky pro retrospektivy

## 2. Onboarding a týmová efektivita
- Pravidelně pořádat onboarding workshop pro nové členy
- Aktualizovat onboarding dokumentaci a lessons learned
- Zavést mentoring pro nováčky
- Sledovat spokojenost a produktivitu nových členů

## 3. Bezpečnost a compliance
- Pravidelně auditovat přístupová práva, ověřovat 2FA u adminů
- Testovat obnovu záloh a disaster recovery scénáře
- Omezit nadměrné exporty dat, sledovat audit logy
- Pravidelně aktualizovat bezpečnostní checklisty

## 4. Výkon a škálovatelnost
- Provádět pravidelné load testy, optimalizovat nejpomalejší endpointy
- Kontrolovat velikost assetů, zavést lazy loading a CDN pro frontend
- Pravidelně vyhodnocovat metriky v Prometheus/Grafana

## 5. Monitoring, alerting, reporting
- Automatizovat testování alertů v CI
- Pravidelně vyhodnocovat metriky v Prometheus/Grafana
- Aktualizovat checklisty a provozní dokumentaci dle incidentů

## 6. Zpětná vazba a iterace
- Sledovat uživatelskou zpětnou vazbu, rychle reagovat na opakované problémy
- Sdílet best practices v týmu, pořádat micro-workshopy
- Pravidelně analyzovat logy kritických úkolů a generovat reporty pro retrospektivy

---
Každý bod lze rozpracovat do konkrétních implementací a skriptů dle priorit projektu.
