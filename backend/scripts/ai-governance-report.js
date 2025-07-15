// ai-governance-report.js
// Automatizovaný AI Governance Report: sumarizace audit logu, incidentů, změn práv a pokusů o neoprávněný přístup

const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const User = require('../models/User');

async function generateGovernanceReport() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Audit logy za poslední týden a předchozí týden
  const auditEvents = await AuditLog.find({ timestamp: { $gte: weekAgo } }).lean();
  const auditEventsPrev = await AuditLog.find({ timestamp: { $gte: twoWeeksAgo, $lt: weekAgo } }).lean();
  // Bezpečnostní incidenty
  const securityAlerts = await SecurityAlert.find({ createdAt: { $gte: weekAgo } }).lean();
  const securityAlertsPrev = await SecurityAlert.find({ createdAt: { $gte: twoWeeksAgo, $lt: weekAgo } }).lean();
  // Změny práv
  const userChanges = await User.find({ 'audit.updatedAt': { $gte: weekAgo } }, 'email permissions audit').lean();
  const userChangesPrev = await User.find({ 'audit.updatedAt': { $gte: twoWeeksAgo, $lt: weekAgo } }, 'email permissions audit').lean();

  // Pokusy o neoprávněný přístup
  const unauthorizedAttempts = auditEvents.filter(e => e.type === 'unauthorized');
  const unauthorizedAttemptsPrev = auditEventsPrev.filter(e => e.type === 'unauthorized');

  // Anomálie: nárůst incidentů, změn práv, pokusů o přístup
  function percentChange(current, prev) {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  }
  const anomalySummary = {
    auditEventChange: percentChange(auditEvents.length, auditEventsPrev.length),
    securityAlertChange: percentChange(securityAlerts.length, securityAlertsPrev.length),
    userChangeChange: percentChange(userChanges.length, userChangesPrev.length),
    unauthorizedAttemptChange: percentChange(unauthorizedAttempts.length, unauthorizedAttemptsPrev.length),
  };

  // Nejčastější typy incidentů
  const incidentTypes = {};
  for (const alert of securityAlerts) {
    incidentTypes[alert.type] = (incidentTypes[alert.type] || 0) + 1;
  }
  const topIncidentTypes = Object.entries(incidentTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));

  // Nejaktivnější uživatelé (pozitivně: změny, negativně: incidenty)
  const userActivity = {};
  for (const e of auditEvents) {
    const email = e.user?.email || 'neznámý';
    userActivity[email] = (userActivity[email] || 0) + 1;
  }
  const topUsers = Object.entries(userActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([email, count]) => ({ email, count }));

  const userIncidentActivity = {};
  for (const e of unauthorizedAttempts) {
    const email = e.user?.email || 'neznámý';
    userIncidentActivity[email] = (userIncidentActivity[email] || 0) + 1;
  }
  const topIncidentUsers = Object.entries(userIncidentActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([email, count]) => ({ email, count }));

  // Doporučení (heuristika)
  const recommendations = [];
  if (anomalySummary.unauthorizedAttemptChange > 50 && unauthorizedAttempts.length > 5) {
    recommendations.push('Výrazný nárůst pokusů o neoprávněný přístup – doporučujeme auditovat přístupová práva a zvážit MFA.');
  }
  if (anomalySummary.userChangeChange > 50 && userChanges.length > 2) {
    recommendations.push('Zvýšený počet změn práv – doporučujeme zkontrolovat schvalovací workflow a audit logy.');
  }
  if (topIncidentTypes.some(t => t.type === 'unauthorized' && t.count > 3)) {
    recommendations.push('Opakované incidenty typu "unauthorized" – doporučujeme detailní analýzu a případné omezení přístupu.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Stav governance je stabilní, nejsou detekovány zásadní anomálie.');
  }

  return {
    generatedAt: now,
    auditEvents,
    securityAlerts,
    userChanges,
    unauthorizedAttempts,
    summary: {
      auditEventCount: auditEvents.length,
      securityAlertCount: securityAlerts.length,
      userChangeCount: userChanges.length,
      unauthorizedAttemptCount: unauthorizedAttempts.length,
    },
    anomalySummary,
    topIncidentTypes,
    topUsers,
    topIncidentUsers,
    recommendations,
  };
}

if (require.main === module) {
  // CLI/demo spuštění
  require('../config/db')().then(async () => {
    const report = await generateGovernanceReport();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  });
}

module.exports = generateGovernanceReport;
