# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ServisKol – Frontend

## Onboarding

1. Přejděte do složky `frontend`.
2. Nainstalujte závislosti:
   ```bash
   npm install
   ```
3. Spusťte vývojový server:
   ```bash
   npm run dev
   ```
4. Otevřete aplikaci na [http://localhost:5173](http://localhost:5173)

## Architektura
- React (Vite)
- TailwindCSS + MUI
- React Router, Context API (autentizace)
- Komponenty: správa kol, servis, chat, věrnostní program, AI dotazník, export, počasí

## Vývojářské tipy
- Pro přístup k API je nutné být přihlášen (token v localStorage).
- Pro úpravy UI využijte Tailwind a MUI komponenty.
- Nové stránky přidávejte do `src/pages`, sdílené komponenty do `src/components`.
- Pro testování použijte mock backend nebo reálné API.

## Produkční build a nasazení

1. Pro build spusťte:
   ```bash
   npm run build
   ```
2. Výstup najdete ve složce `dist` – tu nasadíte na server (např. Nginx, Vercel, Netlify).
3. Pro lokální testování buildu:
   ```bash
   npm run preview
   ```
4. Doporučené proměnné v `.env.production`:
   - `VITE_API_URL=https://vase-domena.cz/api`

Pro nasazení na vlastní server doporučujeme použít reverse proxy (Nginx) a HTTPS.
