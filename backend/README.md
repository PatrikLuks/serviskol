## AI strategický report pro management

Pro vygenerování kvartálního AI strategického reportu spusťte:

```bash
OPENAI_API_KEY=... node scripts/aiStrategicReport.js
```

Skript:
- shrne stav bezpečnosti, compliance, incidentů, self-healing a AI predikcí
- identifikuje trendy, slabá místa, úspěchy a rizika
- navrhne konkrétní roadmapu zlepšení na další kvartál
- výstup uloží do `reports/ai_strategic_report_YYYY-MM-DD.md`

**Doporučení:**
- Sdílejte s managementem a využijte pro strategické rozhodování
## AI self-healing (ostrý zásah)

Pro automatizované provedení self-healing kroků podle AI doporučení spusťte:

```bash
OPENAI_API_KEY=... FIREWALL_API_URL=... FIREWALL_API_TOKEN=... node scripts/aiSelfHealing.js [cesta/k/ai_analýze.md]
```

Skript:
- načte AI bezpečnostní analýzu/playbook
- provede skutečné akce: blokace IP přes firewall API, restart služby, obnova DB, rollback
- vše loguje do `logs/self_healing.log`

**Doporučení:**
- Používejte pouze v produkci s ověřenými AI doporučeními a auditujte všechny zásahy
## Incident response playbook (AI automatizace)

Pro automatizovanou reakci na incident podle AI doporučení spusťte:

```bash
OPENAI_API_KEY=... node scripts/incidentResponsePlaybook.js [cesta/k/ai_analýze.md]
```

Skript:
- načte AI bezpečnostní analýzu nebo predikci
- získá od AI konkrétní kroky reakce (izolace, blokace IP, restart, rollback, notifikace)
- simuluje provedení kroků a vše loguje do `logs/incident_response.log`

**Doporučení:**
- Integrujte do workflow pro rychlou a auditovatelnou reakci na incidenty
## AI predikce útoků a anomálií

Pro automatizovanou AI predikci útoků a anomálií na základě historických logů spusťte:

```bash
OPENAI_API_KEY=... node scripts/aiThreatPrediction.js
```

Skript:
- analyzuje poslední záznamy z bezpečnostních logů a incidentů
- využije AI k detekci trendů, predikci rizik a navrhne preventivní opatření
- výstup uloží do `reports/ai_threat_prediction_YYYY-MM-DD.md`

**Doporučení:**
- Spouštějte pravidelně (např. týdně/měsíčně) a sdílejte s managementem
## Automatizovaný disaster recovery test

Pro ověření obnovy ze zálohy a AI sumarizaci výsledku spusťte:

```bash
OPENAI_API_KEY=... node scripts/automatedDisasterRecoveryTest.js
```

Skript:
- najde poslední zálohu v `backups/`
- spustí obnovu pomocí `restore_mongo.sh`
- výsledek předá AI k sumarizaci a uloží do `reports/disaster_recovery_test_YYYY-MM-DD.txt`

**Doporučení:**
- Spouštějte pravidelně (např. měsíčně) a archivujte výsledky pro auditní účely
## Automatizovaný compliance report

Pro vygenerování souhrnného compliance reportu (GDPR, bezpečnost, auditní stopa) spusťte:

```bash
node scripts/generateComplianceReport.js
```

Skript:
- shrne stav záloh, incidentů, auditních logů, AI bezpečnostní a pentest analýzy
- výstup uloží do `reports/compliance_report_YYYY-MM-DD.txt`

**Doporučení:**
- Spouštějte pravidelně (měsíčně/kvartálně) a archivujte pro auditní účely
## AI analýza výsledků penetračních testů

Pro automatizovanou AI sumarizaci a doporučení k výsledkům penetračních testů spusťte:

```bash
OPENAI_API_KEY=... node scripts/aiPentestAnalysis.js
```

Skript:
- načte výstup z pentestu (`reports/pentest_report.txt`)
- použije OpenAI k detekci kritických/vysokých rizik a navrhne opatření
- výstup uloží do `reports/ai_pentest_analysis.md`

**Doporučení:**
- Spouštějte po každém pentestu, výstupy archivujte pro auditní účely
## Multi-channel alerting (Slack/webhook)

Pro odeslání alertu na Slack nebo jiný webhook kanál spusťte:

```bash
SLACK_WEBHOOK_URL=... node scripts/alertSlackWebhook.js "Bezpečnostní incident: ..."
```

Skript:
- odešle zprávu na zadaný Slack/webhook kanál (nastavte URL v proměnné `SLACK_WEBHOOK_URL`)
- lze použít v CI, v návaznosti na bezpečnostní audit, AI analýzu nebo pentest

**Doporučení:**
- Integrujte do automatizovaných workflow pro rychlou reakci týmu
## Automatizované penetrační testy

Pro základní automatizovaný penetrační test backendu spusťte:

```bash
PENTEST_TARGET=http://localhost:3001 node scripts/automatedPentest.js
```

Skript:
- využívá OWASP ZAP CLI (musí být nainstalováno: `pip install python-owasp-zap-v2.4` nebo použijte docker image)
- provede základní scan cílového backendu
- výsledek uloží do `reports/pentest_report.txt`

**Doporučení:**
- Spouštějte v izolovaném prostředí (testovací instance)
- Výsledky archivujte pro auditní účely
## Automatizovaná notifikace a eskalace bezpečnostních incidentů

Pro automatizované odeslání notifikace managementu a případnou eskalaci incidentu na základě AI bezpečnostní analýzy spusťte:

```bash
node scripts/notifySecurityIncident.js
```

Skript:
- načte poslední AI bezpečnostní report (`reports/ai_security_analysis.md`)
- odešle e-mail na adresu z proměnné `MANAGEMENT_EMAIL` (SMTP údaje nastavte v proměnných `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`)
- při detekci kritického nálezu automaticky eskaluje incident do ServiceNow (pokud je nastavena integrace)

**Doporučení:**
- Spouštějte automaticky po vygenerování AI bezpečnostní analýzy
- Archivujte všechny notifikace a incidenty pro auditní účely

## Automatizované post-mortem reporty

Pro generování post-mortem reportu s AI sumarizací příčin a doporučení spusťte:

```
OPENAI_API_KEY=... node scripts/generatePostmortemReport.js
```

Skript načte poslední incident z `reports/incident.log` a vygeneruje post-mortem report do složky `postmortems/`.

## Integrace s incident management systémem (ServiceNow)

Pro automatické vytváření incidentů při kritickém selhání exportu nastavte v `.env` souboru:

```
SERVICENOW_INSTANCE=dev12345.service-now.com
SERVICENOW_USER=uzivatel
SERVICENOW_PASS=heslo
```

Skript `scripts/createIncidentServiceNow.js` vytvoří incident v ServiceNow. Doporučené volání při kritickém alertu:

```
node /Users/patrikluks/Applications/serviskol/backend/scripts/createIncidentServiceNow.js "Kritický alert: Opakované selhání exportů" "Systém detekoval opakované selhání exportů. Doporučujeme okamžitou kontrolu a eskalaci."
```


## Periodický management reporting

Skript `scripts/sendWeeklyManagementReport.js` odešle shrnutí statistik, AI doporučení a ASCII graf trendu úspěšných i neúspěšných exportů na management email. Doporučené spuštění přes cron:

```
0 8 * * MON node /Users/patrikluks/Applications/serviskol/backend/scripts/sendWeeklyManagementReport.js
```


Pro automatizované týdenní reporty exportních statistik a AI doporučení nastavte v `.env` souboru jednu z proměnných:

```
MANAGEMENT_EMAIL=management@example.com           # Jeden email
MANAGEMENT_EMAILS=management@example.com,ceo@example.com # Více emailů oddělených čárkou
```

+Skript `scripts/sendWeeklyManagementReport.js` odešle shrnutí statistik, AI doporučení a ASCII graf trendu selhání exportů na management email. Doporučené spuštění přes cron:
+
+```
+0 8 * * MON node /Users/patrikluks/Applications/serviskol/backend/scripts/sendWeeklyManagementReport.js
+```
Skript `scripts/sendWeeklyManagementReport.js` odešle shrnutí statistik, AI doporučení a ASCII graf trendu selhání exportů na management email. Doporučené spuštění přes cron:

```
0 8 * * MON node /Users/patrikluks/Applications/serviskol/backend/scripts/sendWeeklyManagementReport.js
```

## Automatizovaný bezpečnostní audit

Pro pravidelnou kontrolu úniku citlivých údajů a zranitelností spusťte:

```bash
node scripts/automatedSecurityAudit.js
```

Skript:

**Doporučení:**

## AI analýza bezpečnostních logů

Pro automatizovanou sumarizaci a doporučení k bezpečnostním logům spusťte:

```bash
OPENAI_API_KEY=... node scripts/aiSecurityLogAnalysis.js
```

Skript:
- načte `logs/security.log`
- použije OpenAI k detekci podezřelých aktivit, slabých míst a navrhne opatření
- výstup uloží do `reports/ai_security_analysis.md`

**Doporučení:**
- Spouštějte po každé větší změně, incidentu nebo pravidelně v rámci reportingu

## SMS alerty pro kritické selhání exportu

Pro automatizované SMS alerty při kritickém selhání exportu nastavte následující proměnné prostředí v `.env` souboru:

```
TWILIO_ACCOUNT_SID=...      # SID vašeho Twilio účtu
TWILIO_AUTH_TOKEN=...       # Auth token z Twilio
TWILIO_FROM_NUMBER=+420...  # Odesílací číslo (Twilio)
CRITICAL_ALERT_PHONE=+420... # Cílové číslo pro SMS alerty
```

Skript `scripts/sendCriticalAlertSms.js` je automaticky spouštěn při detekci kritického alertu v export logu (viz `scripts/analyzeExportLog.js`).
# ServisKol – Backend

## Onboarding

1. Naklonujte repozitář a přejděte do složky `backend`.
2. Nainstalujte závislosti:
   ```bash
   npm install
   ```
3. Spusťte MongoDB (lokálně nebo v cloudu, např. MongoDB Atlas).
4. Vytvořte `.env` s proměnnou `JWT_SECRET` (volitelně).
5. Spusťte server:
   ```bash
   npm start
   ```
6. Pro testy spusťte:
   ```bash
   npm test
   ```

## Architektura
- Node.js + Express
- MongoDB (Mongoose)
- JWT autentizace
- Validace vstupů, error handling, bezpečnostní middleware (helmet, cors, rate limit)
- Testy: Jest, Supertest
- CI/CD: GitHub Actions

## Klíčové endpointy
- `/api/users` – registrace, přihlášení
- `/api/bikes` – správa kol, komponent, servisní historie
- `/api/loyalty` – věrnostní program, gamifikace
- `/api/chat` – chat klient–technik
- `/api/intake` – AI příjmový dotazník
- `/api/export` – export dat
- `/api/integrations` – integrace (počasí, Strava)

## Vývojářské tipy
- Všechny endpointy (kromě registrace/přihlášení) vyžadují JWT v hlavičce `Authorization`.
- Testovací data lze zadat přes API nebo MongoDB shell.
- Pro rozšíření použijte existující architekturu controllerů a middleware.

## Produkční build a běh

1. Zajistěte proměnné v `.env.production` (např. `MONGODB_URI`, `JWT_SECRET`, SMTP, atd.).
2. Pro běh v produkci spusťte:
   ```bash
   NODE_ENV=production node server.js
   ```
3. Doporučujeme použít reverse proxy (Nginx) a HTTPS.
4. Pro monitoring/logování využijte Sentry, Papertrail, nebo MongoDB Atlas monitoring.

## Nasazení pomocí Docker Compose

1. Ujistěte se, že máte nainstalovaný Docker a Docker Compose.
2. V kořenovém adresáři spusťte:
   ```bash
   docker-compose up --build
   ```
3. Backend poběží na http://localhost:5000, frontend na http://localhost:5173.
4. MongoDB poběží na portu 27017 a data budou uložena v persistentním svazku.

## Health-check endpoint

Pro monitoring backendu použijte endpoint:
```
GET /api/health
```
Vrací JSON se stavem aplikace a databáze.

## Audit logování
- Klíčové akce (změna stavu servisu, přiřazení technika, export dat) jsou logovány do `logs/audit.log`.
- Pro pokročilou analýzu lze logy ukládat i do MongoDB.

## Zálohování MongoDB

Pro manuální zálohu spusťte:
```bash
bash scripts/backup_mongo.sh
```
Zálohy se ukládají do složky `backups` s časovým razítkem.

Pro automatizaci nastavte cron job nebo použijte obdobný plánovač.

## Disaster recovery

### Zálohování
- Pro manuální zálohu spusťte: `./scripts/backup_mongo.sh`
- Zálohy se ukládají do složky `backups/`

### Obnova zálohy
- Pro obnovu spusťte: `./scripts/restore_mongo.sh <soubor_zalohy>`
- Podporuje .gz archiv i adresářovou zálohu
- Příklad: `./scripts/restore_mongo.sh backups/serviskol-2025-07-10.gz`

### Troubleshooting
- Ověřte, že běží MongoDB na localhost:27017
- Problémy s právy: spusťte skript s `sudo` nebo upravte práva k souborům
- Pro detailní logy použijte přepínač `-v` u mongorestore


## Product analytics (PostHog)
- Pro logování klíčových backend akcí použijte utilitu `utils/posthog.js`:
  ```js
  const { captureEvent } = require('./utils/posthog');
  captureEvent(userId, 'api_export', { typ: 'csv', segment });
  ```
- Nastavte `POSTHOG_KEY` a `POSTHOG_HOST` v `.env`.
- Doporučené eventy: registrace, login, export, servisní workflow, incident, onboarding, AI chat, analytika, gamifikace.

### Základní monitoring backendu
- Skript `./scripts/monitor_health.sh` kontroluje dostupnost endpointu `/api/health/health`
- V případě chyby odešle e-mail (nutné mít nastavený příkaz `mail` a správně nastavený SMTP server na serveru)
- Nastavte svůj e-mail v proměnné `EMAIL_TO` ve skriptu
- Pro pravidelné spouštění přidejte do crontabu např. každých 5 minut:
  ```
  */5 * * * * /cesta/k/projektu/backend/scripts/monitor_health.sh >> /cesta/k/projektu/backend/logs/monitor.log 2>&1
  ```
- Pro pokročilý monitoring lze využít UptimeRobot, Prometheus, Grafana nebo Sentry

## Nejčastější chyby a jejich řešení

- **MongoDB neběží**: Ověřte, že je spuštěn proces `mongod` na `localhost:27017`.
- **Port obsazen**: Změňte proměnnou `PORT` v `.env` nebo uvolněte port (např. 5000/3001).
- **CORS chyba**: Ověřte, že backend povoluje požadavky z domény frontendu (nastavení CORS v serveru).
- **Chybí .env**: Zkopírujte `.env.example` nebo vytvořte `.env` dle README.
- **Test leaks (A worker process has failed to exit gracefully...)**: Ujistěte se, že v serveru nejsou běžící intervaly nebo neukončené asynchronní operace během testů.
- **Chyba připojení k databázi**: Zkontrolujte správnost `MONGODB_URI` v `.env` a dostupnost MongoDB.
- **Chyba při obnově zálohy**: Ověřte práva k souborům a že je správně nainstalován `mongorestore`.

---

Začněte implementací základních modelů a autentizace.
