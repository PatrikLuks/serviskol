
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
