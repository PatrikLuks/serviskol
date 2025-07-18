// Mock implementace pro push notifikace (FCM, OneSignal, Expo...)
// V produkci nahraďte konkrétní integrací dle vašeho řešení

/**
 * Odeslání push notifikace uživateli
 * @param {string} pushToken - token zařízení uživatele
 * @param {string} title - titulek notifikace
 * @param {string} message - text notifikace
 * @returns {Promise<{success: boolean, error?: any}>}
 */
async function sendPushNotification(pushToken, title, message) {
  if (!pushToken) return { success: false, error: 'Chybí pushToken' };
  // TODO: Integrace s FCM/OneSignal/Expo
  console.log(`[MOCK] Push notification to ${pushToken}: ${title} - ${message}`);
  return { success: true };
}

module.exports = sendPushNotification;
