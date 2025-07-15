// Automatizovaná eskalace kritických nerealizovaných doporučení (Notion, AI, retrospektivy)
require('dotenv').config();
const { main: predictImpact } = require('./ai_predict_unrealized_impact');
const { sendSlackNotification } = require('../utils/slackNotifier');
const fs = require('fs');

async function escalateCriticalTasks() {
  // Získání AI predikce dopadu nerealizovaných doporučení
  const impactReport = await predictImpact();
  // Heuristika: pokud report obsahuje "kritické riziko" nebo "vysoký dopad", eskalovat
  if (/kritick[áé]|vysok[ýá]/i.test(impactReport)) {
    await sendSlackNotification({
      text: `Kritické nerealizované doporučení!\n${impactReport}`,
      channel: process.env.SLACK_CRITICAL_CHANNEL || '#alerts'
    });
    // Lze rozšířit o SIEM/SOC integraci
    console.log('Eskalace: Slack alert odeslán.');
  } else {
    console.log('Žádné kritické riziko, eskalace není nutná.');
  }
}

if (require.main === module) {
  escalateCriticalTasks();
}
