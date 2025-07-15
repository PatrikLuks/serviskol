# Výkonnostní a asset audit checklist

Tento checklist slouží k pravidelnému auditu výkonu aplikace a optimalizaci assetů v projektu ServisKol.

## 1. Výkon backendu
- [ ] Jsou pravidelně profilovány nejpomalejší endpointy?
- [ ] Probíhá optimalizace pomalých DB dotazů?
- [ ] Jsou v Prometheus sledovány metriky latence a vytížení?
- [ ] Probíhá automatizované testování výkonu (load testy v CI)?

## 2. Výkon frontendu
- [ ] Je velikost JS/CSS bundle pod kontrolou?
- [ ] Probíhá lazy loading velkých komponent?
- [ ] Jsou assety (obrázky, fonty) optimalizovány a servírovány přes CDN?
- [ ] Je měřena a sledována doba načtení stránky (LCP, FCP, TTI)?

## 3. Automatizace a monitoring
- [ ] Jsou výsledky load testů a metrik pravidelně vyhodnocovány?
- [ ] Jsou alerty na degradaci výkonu nastaveny v Prometheus/Sentry?
- [ ] Probíhá pravidelná aktualizace závislostí a bezpečnostní audit?

## 4. Dokumentace a onboarding
- [ ] Je onboarding dokumentace aktuální a obsahuje postupy pro profilaci a optimalizaci?
- [ ] Jsou návody na řešení výkonnostních problémů snadno dostupné?

## 5. Pravidelnost auditu
- [ ] Probíhá audit alespoň 1x za měsíc?
- [ ] Jsou z auditu vyvozovány konkrétní akční kroky?

---

Checklist pravidelně aktualizujte dle vývoje projektu, nových poznatků a incidentů.

---

## Inovace a trendy
- [ ] Pravidelně sledujte nové trendy v oblasti observability, AI a bezpečnosti
- [ ] Zvažte zavedení nových nástrojů a technologií dle potřeb projektu
- [ ] Sdílejte inovace a zkušenosti v týmu
