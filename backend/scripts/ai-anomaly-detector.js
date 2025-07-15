// ai-anomaly-detector.js
// AI detekce anomálií v audit logu a incident reporting

const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const { sendSlackNotification } = require('../utils/slackNotifier');

async function detectAnomalies() {
  const now = new Date();
  const week = 7 * 24 * 60 * 60 * 1000;
  const lastWeek = new Date(now.getTime() - week);
  const prevWeek = new Date(now.getTime() - 2 * week);

  // Počet incidentů a změn práv za poslední a předchozí týden
  const incidentsNow = await AuditLog.countDocuments({ type: 'unauthorized', createdAt: { $gte: lastWeek } });
  const incidentsPrev = await AuditLog.countDocuments({ type: 'unauthorized', createdAt: { $gte: prevWeek, $lt: lastWeek } });
  const rightsNow = await AuditLog.countDocuments({ type: /user.*change/, createdAt: { $gte: lastWeek } });
  const rightsPrev = await AuditLog.countDocuments({ type: /user.*change/, createdAt: { $gte: prevWeek, $lt: lastWeek } });

  // Heuristika: nárůst o 100 % nebo více = anomálie
  const anomalies = [];
  if (incidentsPrev > 0 && incidentsNow >= incidentsPrev * 2) {
    anomalies.push({
      type: 'incident-spike',
      message: `Nárůst incidentů: ${incidentsPrev} → ${incidentsNow} (za týden)`
    });
  }
  if (rightsPrev > 0 && rightsNow >= rightsPrev * 2) {
    anomalies.push({
      type: 'rights-change-spike',
      message: `Nárůst změn práv: ${rightsPrev} → ${rightsNow} (za týden)`
    });
  }

  // Alerty a notifikace
  for (const anomaly of anomalies) {
    await SecurityAlert.create({
      type: 'anomaly',
      message: anomaly.message,
      details: anomaly,
      createdAt: now
    });
    await sendSlackNotification({
      text: `🚨 [AI Governance] Detekována anomálie: ${anomaly.message}`
    });
  }

  return {
    detectedAt: now,
    incidentsPrev,
    incidentsNow,
    rightsPrev,
    rightsNow,
    anomalies
  };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await detectAnomalies();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  });
}

module.exports = detectAnomalies;
