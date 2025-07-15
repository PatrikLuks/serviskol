# Dokumentace alertingu a monitoringu

Tento dokument popisuje klíčové alerty a metriky používané v projektu ServisKol.

## Prometheus alerty

- **BackendDown**: Backend není dostupný déle než 2 minuty (kritický alert)
- **BackendHighErrorRate**: Více než 5 % požadavků na backend končí chybou 5xx po dobu 5 minut (varování)
- **BackendHighLatency**: 95. percentil latence požadavků na backend je vyšší než 1s po dobu 5 minut (varování)
- **MongoDBDown**: MongoDB instance je nedostupná déle než 2 minuty (kritický alert)
- **BackendLowMemory**: Dostupná paměť na backendu je pod 10 % po dobu 5 minut (varování)
- **BackendHighCPU**: Vytížení CPU backendu je vyšší než 80 % po dobu 5 minut (varování)

## Klíčové metriky
- Latence HTTP požadavků (histogram_quantile)
- Chybovost HTTP požadavků (rate 5xx)
- Dostupnost backendu a DB (up)
- Využití paměti a CPU (node_memory, process_cpu_seconds_total)

## Postup při incidentu (runbook)
1. Ověřte, zda je incident již řešen (komunikace v týmu).
2. Zkontrolujte alerty v Prometheus/Sentry.
3. Proveďte základní diagnostiku (logy, metriky, stav služeb).
4. Pokud je potřeba, restartujte příslušnou službu.
5. Po vyřešení incidentu proveďte zápis do incident logu a případnou post-mortem analýzu.

## Testování alertingu
- Alerty jsou testovány automatizovaně v CI skriptem `backend/scripts/ci_test_alert.sh`.
- Test simuluje výpadek endpointu a ověřuje, že alert je vygenerován (TODO: doplnit automatickou kontrolu alertu přes Prometheus API).

## Pravidelný audit
- Používejte checklist `MONITORING_ALERTING_AUDIT_CHECKLIST.md`.
- Audit provádějte minimálně 1x měsíčně.

---

Tento dokument pravidelně aktualizujte dle vývoje projektu a alertů.
