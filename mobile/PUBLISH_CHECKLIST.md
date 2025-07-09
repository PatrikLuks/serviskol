# Publikační checklist – mobilní aplikace ServisKol

## Build a příprava
- [ ] Ověřit všechny workflow na reálných zařízeních (Android/iOS)
- [ ] Zkontrolovat ikony, splash screen, název a popis v app.json
- [ ] Ověřit push notifikace v produkčním Expo prostředí (EAS)
- [ ] Spustit build:
  - `eas build -p android --profile production`
  - `eas build -p ios --profile production`
- [ ] Otestovat APK/AAB/IPA na reálných zařízeních

## Metadata a App Store/Google Play
- [ ] Připravit screenshoty (1242x2688 px) a demo video
- [ ] Připravit krátký popis, klíčová slova, propagační texty (CZ/EN)
- [ ] Vyplnit metadata v Google Play Console a Apple Developer
- [ ] Nahrát buildy, screenshoty, video
- [ ] Přidat testovací uživatele a data pro review týmy

## Monitoring a podpora
- [ ] Ověřit monitoring chyb (Sentry, Expo)
- [ ] Nastavit alerty na výpadky, push doručení
- [ ] Připravit šablony pro reakci na zpětnou vazbu

## Marketing a růst
- [ ] Vytvořit landing page s odkazy na app store, screenshoty, kontaktem
- [ ] Připravit newsletter pro první uživatele a partnery
- [ ] Oslovit komunitu, partnery, sociální sítě

---

Po úspěšné publikaci pravidelně analyzujte metriky, sbírejte zpětnou vazbu a iterujte roadmapu.
