# Rychlý start: Spuštění celé aplikace ServisKol

## 1. Otevřete terminál a přejděte do kořenové složky projektu

```
cd /Users/patrikluks/Applications/serviskol
```

## 2. Nainstalujte závislosti (pouze při prvním spuštění nebo po změně balíčků)

```
npm install
```

## 3. Spusťte celý projekt jedním příkazem

```
npm run dev
```

- Tím se automaticky spustí backend i frontend.
- Frontend poběží na adrese, kterou vypíše terminál (obvykle http://localhost:5173).
- Backend poběží na http://localhost:3001.

## 4. Chyby sledujte v terminálu

Pokud se objeví chyba, zkopírujte ji a pošlete ji vývojáři nebo do chatu s podporou.

---

Pro samostatné spuštění backendu nebo frontendu:

- Backend:
  ```
  cd backend
  npm start
  ```
- Frontend:
  ```
  cd frontend
  npm run dev
  ```
