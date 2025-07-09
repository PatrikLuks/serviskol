# Onboarding checklist pro vývojáře

## Backend
- [x] Klonovat repozitář a přejít do složky `backend`
- [x] Nainstalovat závislosti (`npm install`)
- [x] Zajistit běžící MongoDB (lokálně nebo Atlas)
- [x] Vytvořit `.env` s `JWT_SECRET`, SMTP, Strava, Stripe klíči
- [x] Spustit server (`npm start`)
- [x] Otestovat klíčové endpointy (registrace, login, CRUD, export, gamifikace, integrace)
- [x] Spustit testy (`npm test`)
- [x] Zkontrolovat audit logování a alerty

## Frontend
- [x] Klonovat repozitář a přejít do složky `frontend`
- [x] Nainstalovat závislosti (`npm install`)
- [x] Spustit vývojový server (`npm run dev`)
- [x] Ověřit PWA (manifest, service worker)
- [x] Otestovat přihlášení, 2FA, notifikace, gamifikaci, exporty, integrace
- [x] Ověřit responzivitu a UX na mobilu

## Další kroky
- [ ] Projít dokumentaci v README (backend, frontend)
- [ ] Projít onboarding checklist
- [ ] Přidat nové vývojáře do repozitáře a CI/CD
- [ ] Zajistit monitoring a alerty v produkci
- [ ] Pravidelně aktualizovat dokumentaci a checklist

---

Pro detailní popis architektury, workflow a rozšíření viz README v backendu a frontendu.
