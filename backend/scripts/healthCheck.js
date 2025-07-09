// Skript pro kontrolu dostupnosti API a alertování adminů při výpadku
const fetch = require('node-fetch');
const { alertAdmins } = require('../utils/notificationUtils');

(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/health/health');
    if (!res.ok) throw new Error('API nedostupné');
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('API není v pořádku');
    console.log('API OK:', data.timestamp);
  } catch (err) {
    await alertAdmins({ subject: 'ALERT: Výpadek API', text: `API není dostupné: ${err.message}` });
    console.error('ALERT ODESLÁN:', err.message);
  }
})();
