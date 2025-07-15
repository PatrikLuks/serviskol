// ai-incident-risk-predictor.js
// Predikce rizika nárůstu incidentů na základě trendu audit logů a incidentů

const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

async function predictIncidentRisk() {
  const now = new Date();
  const week = 7 * 24 * 60 * 60 * 1000;
  // Data za poslední 4 týdny
  const periods = [0, 1, 2, 3].map(i => ({
    from: new Date(now.getTime() - (i + 1) * week),
    to: new Date(now.getTime() - i * week)
  })).reverse();

  // Počet incidentů a pokusů o neoprávněný přístup v každém týdnu
  const stats = [];
  for (const p of periods) {
    const auditCount = await AuditLog.countDocuments({
      timestamp: { $gte: p.from, $lt: p.to },
      type: 'unauthorized'
    });
    const alertCount = await SecurityAlert.countDocuments({
      createdAt: { $gte: p.from, $lt: p.to }
    });
    stats.push({ week: p.from.toISOString().slice(0, 10), auditCount, alertCount });
  }

  // Jednoduchý lineární trend (rozdíl poslední a první hodnoty)
  const auditTrend = stats[3].auditCount - stats[0].auditCount;
  const alertTrend = stats[3].alertCount - stats[0].alertCount;

  // Heuristická predikce rizika
  let riskLevel = 'nízké';
  if (auditTrend > 2 || alertTrend > 2) riskLevel = 'střední';
  if (auditTrend > 5 || alertTrend > 5) riskLevel = 'vysoké';

  // Doporučení
  const recommendations = [];
  if (riskLevel === 'vysoké') {
    recommendations.push('Okamžitě auditujte přístupová práva, zvažte omezení přístupů a aktivaci MFA.');
  } else if (riskLevel === 'střední') {
    recommendations.push('Zvyšte monitoring, zvažte preventivní školení a audit logů.');
  } else {
    recommendations.push('Stav je stabilní, doporučujeme pokračovat v pravidelném monitoringu.');
  }

  // Automatizovaná reakce při vysokém riziku
  if (riskLevel === 'vysoké') {
    try {
      const { sendSlackNotification } = require('../utils/slackNotifier');
      await sendSlackNotification({
        text: `🚨 [AI Governance] Predikce rizika incidentů: VYSOKÉ! Doporučená opatření: ${recommendations.join(' ')}`
      });
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        type: 'ai-incident-risk',
        action: 'AI predikce rizika: vysoké',
        details: { stats, auditTrend, alertTrend, recommendations },
        createdAt: now
      });
    } catch (e) {
      // ignore
    }
  }

  return {
    generatedAt: now,
    stats,
    auditTrend,
    alertTrend,
    riskLevel,
    recommendations
  };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await predictIncidentRisk();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  });
}

module.exports = predictIncidentRisk;
