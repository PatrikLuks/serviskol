# Load test backend API (k6)

Tento skript spustí základní zátěžový test na health endpoint backendu pomocí k6.

## Požadavky
- Node.js
- Backend běží na http://localhost:3001
- [k6](https://k6.io/) je nainstalován (např. `brew install k6` na macOS)

## Spuštění testu

```
cd backend
npm run loadtest
```

## Parametry testu
- 20 virtuálních uživatelů
- 1 minuta
- 95 % požadavků musí být do 800 ms
- méně než 1 % chyb

## Výsledky
Výsledky se zobrazí v terminálu po skončení testu. Pro pokročilejší analýzu lze použít k6 Cloud nebo export do Prometheus/Grafana.

---

Testovací skript: `tests/loadtest.k6.js`

Pro pravidelné spouštění v CI doporučujeme integrovat do workflow a vyhodnocovat thresholdy automaticky.
