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

## Audit logování
- Klíčové akce (změna stavu servisu, přiřazení technika, export dat) jsou logovány do `logs/audit.log`.
- Pro pokročilou analýzu lze logy ukládat i do MongoDB.

---

Začněte implementací základních modelů a autentizace.
