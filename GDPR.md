# GDPR funkce – export a výmaz dat

## Export osobních dat
- Endpoint: `GET /api/gdpr/export` (přihlášený uživatel)
- Vrací veškeré osobní údaje, servisní historii, zprávy
- Akce je auditována

## Žádost o výmaz účtu
- Endpoint: `POST /api/gdpr/delete` (přihlášený uživatel)
- Zaznamená žádost o výmaz, skutečný výmaz provádí admin (doporučeno)
- Akce je auditována

## Doporučení
- Výmaz účtu by měl být schvalován adminem (ochrana proti zneužití)
- O žádosti informujte admina e-mailem nebo v dashboardu
- Po schválení adminem smažte uživatele a veškerá jeho data
- Všechny akce logujte do audit logu

---
> **Poznámka:** Pravidelně ověřujte a aktualizujte tento dokument dle platné legislativy a provozních zkušeností.
