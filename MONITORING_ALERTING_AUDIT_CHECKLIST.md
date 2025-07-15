# Monitoring & Alerting Audit Checklist

Tento checklist slouží k pravidelnému auditu a optimalizaci monitoringu a alertingu v projektu ServisKol.

## 1. Pokrytí alertů
- [ ] Jsou alerty nastaveny pro všechny kritické komponenty (backend, frontend, DB, externí služby)?
- [ ] Pokrývají alerty výpadky, degradaci výkonu, chyby aplikace, nedostupnost závislostí?
- [ ] Jsou alerty rozděleny podle závažnosti (critical, warning, info)?
- [ ] Jsou alerty testovány automatizovaně v CI?

## 2. Monitoring
- [ ] Jsou monitorovány všechny klíčové metriky (latence, chybovost, vytížení, dostupnost)?
- [ ] Jsou metriky vizualizovány v Grafana nebo obdobném nástroji?
- [ ] Je monitoring propojen s alertingem?

## 3. Incident management
- [ ] Je jasně popsán postup při incidentu (runbook)?
- [ ] Jsou incidenty logovány a analyzovány?
- [ ] Probíhá post-mortem analýza závažných incidentů?

## 4. Dokumentace
- [ ] Je dokumentace monitoringu a alertingu aktuální?
- [ ] Je snadno dostupná pro všechny členy týmu?
- [ ] Obsahuje příklady alertů, metrik a postupů při incidentu?

## 5. Pravidelnost auditu
- [ ] Probíhá audit alespoň 1x za měsíc?
- [ ] Jsou z auditu vyvozovány konkrétní akční kroky?

---

Checklist pravidelně aktualizujte a doplňujte dle vývoje projektu a nových poznatků.
