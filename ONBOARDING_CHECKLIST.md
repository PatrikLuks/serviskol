# ONBOARDING_CHECKLIST.md

## Onboarding nových uživatelů a vývojářů – checklist (ServisKol)

### 1. Onboarding uživatelů
- [ ] Přehledný onboarding flow v aplikaci (první spuštění, tipy, ukázky)
- [ ] Stručný průvodce hlavními funkcemi (servisní kniha, gamifikace, věrnostní program, chat)
- [ ] Možnost přeskočit onboarding a vrátit se k němu později
- [ ] Odkaz na nápovědu, FAQ a komunitu
- [ ] Sběr zpětné vazby po dokončení onboardingu

### 2. Onboarding vývojářů
- [ ] Aktuální ONBOARDING_DEV.md a ONBOARDING_MOBILE.md
- [ ] Přehled architektury, datových modelů a workflow
- [ ] Popis CI/CD, testování, deploymentu
- [ ] Seznam klíčových kontaktů a komunikačních kanálů
- [ ] Checklist pro první spuštění projektu (instalace, build, testy, coverage, Docker)
  - [ ] `npm install` ve složkách backend, frontend, mobile
  - [ ] `npm run dev` nebo `docker-compose up --build`
  - [ ] `npm test` a coverage (`npx jest --coverage`, `npm run test` ve frontendu)
  - [ ] Ověřit badge v README (build, coverage, audit, e2e)
  - [ ] Problémy? Viz sekce Troubleshooting v README
- [ ] Odkaz na README a další checklisty (GDPR, SECURITY_AUDIT, MONITORING)
- [ ] **Spustit e2e testy (Cypress) pro ověření loginu a klíčových scénářů:**
  - [ ] Backend (`localhost:3001`) i frontend (`localhost:5173`) musí běžet
  - [ ] Spustit v interaktivním režimu: `cd frontend && npm run test:e2e`
  - [ ] Spustit v headless režimu: `cd frontend && npx cypress run`
  - [ ] Pokud Cypress není nainstalován: `npx cypress install`
  - [ ] Problémy? Viz README sekce e2e testy a troubleshooting


### 3. Onboarding administrátorů a techniků
- [ ] Speciální onboarding pro adminy/techniky (práva, audit logy, reporting)
- [ ] Ukázka správy kol, servisních zakázek, notifikací
- [ ] Odkaz na bezpečnostní a reporting checklisty

---

### 4. Provozní retrospektivy, inovace a zlepšování
- [ ] Pravidelně (např. 1× měsíčně) pořádat provozní retrospektivu – analyzovat incidenty, post-mortem reporty a navrhovat zlepšení
- [ ] Pravidelně aktualizovat šablony, checklisty a dokumentaci dle nových poznatků a incidentů
- [ ] Sledovat nové trendy v oblasti observability, AI a bezpečnosti a zavádět inovace do provozu
- [ ] Sdílet poznatky a best practices v týmu (workshopy, micro-workshopy, týmový chat)

---
Tento checklist pravidelně aktualizujte dle zkušeností a zpětné vazby.

Pro detailní postupy viz [README.md](README.md) a další dokumenty v repozitáři.
