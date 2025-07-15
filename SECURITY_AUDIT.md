# SECURITY_AUDIT.md

## Bezpečnostní audit – checklist (ServisKol)

### 1. Autentizace a autorizace
- [ ] 2FA povinné pro adminy a techniky
- [ ] Správné nastavení rolí a oprávnění (RBAC)
- [ ] Ověření expiračních dob tokenů a jejich bezpečné ukládání
- [ ] Ochrana proti brute-force útokům (rate limiting, lockout)
- [ ] **Doporučení:** V produkci preferujte ukládání JWT tokenu do HttpOnly cookie (ochrana proti XSS). LocalStorage používejte pouze pro čisté SPA, kde je riziko XSS minimalizováno a aplikace neobsahuje citlivé operace.

### 2. Ochrana dat
- [ ] Šifrování hesel (bcrypt/argon2)
- [ ] Šifrování citlivých údajů v databázi (osobní údaje, tokeny)
- [ ] Ověření správné správy session a cookies (Secure, HttpOnly, SameSite)

### 3. API a backend
- [ ] Validace vstupů (XSS, SQL/NoSQL injection, file upload)
- [ ] Ochrana API (rate limiting, CORS, audit logy)
- [ ] Logování a alerty na bezpečnostní incidenty
- [ ] Pravidelné aktualizace závislostí (npm audit, Snyk)

### 4. Frontend a mobilní aplikace
- [ ] Ochrana před XSS (escapování, CSP)
- [ ] Bezpečné ukládání tokenů (ne v localStorage na webu, použít SecureStore v mobilu)
- [ ] Ověření integrity buildů (hash, podpisy)

### 5. Monitoring a alerty
- [ ] Sentry integrované ve všech částech (backend, frontend, mobil)
- [ ] Alerty na kritické chyby a podezřelé chování
- [ ] Pravidelná kontrola audit logů

### 6. GDPR a compliance
- [ ] Práva subjektů (export, výmaz, anonymizace)
- [ ] Auditovatelnost změn a přístupů
- [ ] Transparentní podmínky a možnost opt-out z analytiky

### 7. Disaster recovery
- [ ] Pravidelné testy obnovy záloh
- [ ] Simulace výpadku a obnovy systému

Tento checklist pravidelně aktualizujte dle provozních zkušeností, incidentů a nových trendů v bezpečnosti.

---

## Inovace a trendy
- [ ] Pravidelně sledujte nové trendy v oblasti bezpečnosti, AI a compliance
- [ ] Zvažte zavedení nových nástrojů a technologií dle potřeb projektu
- [ ] Sdílejte inovace a zkušenosti v týmu
