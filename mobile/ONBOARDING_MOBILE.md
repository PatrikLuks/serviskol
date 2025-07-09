# Mobilní aplikace ServisKol – Onboarding a testování

## Testování na reálném zařízení
1. Otevřete složku `mobile` a spusťte vývojový server:
   ```bash
   npm start
   ```
2. Naskenujte QR kód v Expo Go (Android/iOS) nebo spusťte na emulátoru:
   ```bash
   npm run android
   npm run ios
   ```
3. Ověřte:
   - Onboarding, login, registraci, 2FA, gamifikaci, notifikace
   - Zelený, hravý design a responzivitu
   - Push notifikace (Expo) – povolte oprávnění a otestujte doručení

## Demo video a screenshoty
- Nahrajte krátké video (screen recording) s hlavními workflow (onboarding, dashboard, žebříček, odměny, 2FA, notifikace)
- Vytvořte screenshoty pro App Store/Google Play (doporučené rozlišení: 1242x2688 px)

## Dokumentace pro uživatele
- První spuštění: onboarding s tipy a motivací
- Navigace: dashboard → žebříček, odměny, profil, nastavení 2FA
- Body a gamifikace: sbírejte body za servis, feedback, onboarding, věrnost
- Bezpečnost: doporučujeme aktivovat 2FA a notifikace

## Dokumentace pro vývojáře
- Kód je v adresáři `mobile`, architektura: React Native + Expo, navigace Stack
- API endpointy viz `backend/openapi.yaml`
- Pro push notifikace je nutné nastavit Expo push klíč v produkci
- CI/CD workflow je v `.github/workflows/mobile.yml`

---

Pro další rozvoj sbírejte zpětnou vazbu, iterujte gamifikaci a UX, připravte publikaci do obchodů (Expo EAS, App Store, Google Play).
