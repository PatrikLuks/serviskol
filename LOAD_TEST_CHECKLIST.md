# LOAD_TEST_CHECKLIST.md

## Load & Performance Test – checklist (ServisKol)

### 1. Příprava prostředí
- [ ] Otestovat produkční/staging API, nikoliv vývojové prostředí
- [ ] Zálohovat data před testem, připravit monitoring (Sentry, Atlas, server logs)

### 2. Výběr nástrojů
- [ ] k6 (https://k6.io/) – doporučeno pro HTTP API
- [ ] Artillery, JMeter, případně Postman Collection Runner

### 3. Klíčové scénáře
- [ ] Registrace a login uživatele (včetně 2FA)
- [ ] Vytvoření servisní zakázky
- [ ] Zobrazení seznamu kol a detailu kola
- [ ] Odeslání zprávy v chatu
- [ ] Claim odměny (gamifikace)
- [ ] Export/reporting dat

### 4. Parametry testu
- [ ] Různé úrovně zátěže (10, 50, 100, 500+ uživatelů)
- [ ] Délka testu (krátký spike, dlouhodobý steady load)
- [ ] Simulace výpadku (kill server, restart DB)

### 5. Monitoring a vyhodnocení
- [ ] Sledovat odezvu API, chybovost, vytížení serveru a DB
- [ ] Vyhodnotit limity, bottlenecky, chování při zátěži
- [ ] Zaznamenat a analyzovat alerty (Sentry, Atlas, e-mail)

### 6. Akční kroky
- [ ] Optimalizovat endpointy s nejhorší odezvou
- [ ] Navrhnout škálování (např. horizontální, caching, CDN)
- [ ] Opakovat testy po optimalizaci

---
> **Poznámka:** Tento checklist pravidelně aktualizujte dle zkušeností, incidentů a nových trendů v oblasti testování výkonu.

---

## Inovace a trendy
- [ ] Pravidelně sledujte nové trendy v oblasti load/performance testování, observability a AI
- [ ] Zvažte zavedení nových nástrojů a technologií dle potřeb projektu
- [ ] Sdílejte inovace a zkušenosti v týmu
