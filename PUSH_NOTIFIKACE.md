# Push notifikace – základní integrace

## 1. Firebase Cloud Messaging (FCM)
- Založte projekt na https://console.firebase.google.com/
- Vygenerujte web push certifikát (VAPID key)
- Přidejte konfigurační údaje do frontend `.env` (např. `VITE_FIREBASE_API_KEY` atd.)
- Na frontend přidejte knihovnu `firebase` a implementujte registraci push tokenu (viz `/api/users/push-token`)

## 2. Backend
- Endpoint `/api/users/push-token` ukládá FCM token k uživateli
- Endpoint `/api/users/notification-channel` nastavuje preferovaný kanál (in-app, email, push)
- Pro odesílání push použijte balíček `firebase-admin` (Node.js)

## 3. Odesílání push notifikací
- Při generování notifikace (např. v `notificationUtils.js`) ověřte, zda má uživatel pushToken a preferuje push
- Odesílejte push přes FCM (viz dokumentace firebase-admin)

## 4. Doporučení
- Uživatelům nabídněte volbu kanálu v profilu (in-app, email, push)
- Pravidelně testujte doručitelnost push notifikací
- Pro produkci nastavte doménu a HTTPS

---
Tento soubor aktualizujte dle zkušeností z provozu a zpětné vazby.
