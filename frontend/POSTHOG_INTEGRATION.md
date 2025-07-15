# PostHog integrace – základní kroky

1. Vytvořte projekt na https://app.posthog.com/ (nebo self-hostujte PostHog).
2. Získejte Project API Key a nastavte do `.env`:
   ```
   VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxx
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```
3. V `src/main.jsx` je inicializace PostHog SDK.
4. V `src/App.jsx` jsou příklady zachycení klíčových akcí (registrace, login, servisní žádost, onboarding, AI chat, export, analytika, gamifikace).
5. Propojte PostHog s dalšími nástroji (např. Slack, e-mail, dashboardy).
6. Nastavte funnel, retention, heatmapy a pravidelné reporty v PostHog UI.
7. Výsledky analyzujte v retrospektivách a využijte pro prioritizaci roadmapy.

---

Pro backend lze použít knihovnu `posthog-node` a logovat klíčové API akce.
