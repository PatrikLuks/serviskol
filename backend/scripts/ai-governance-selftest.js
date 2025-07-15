// ai-governance-selftest.js
// Automatizovaný self-test governance/reporting pipeline

const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const User = require('../models/User');
const generateGovernanceReport = require('./ai-governance-report');
const predictIncidentRisk = require('./ai-incident-risk-predictor');

async function governanceSelfTest() {
  const results = [];
  // Test 1: Audit logy dostupné
  try {
    const count = await AuditLog.countDocuments();
    results.push({ test: 'Audit logy dostupné', ok: count >= 0 });
  } catch (e) {
    results.push({ test: 'Audit logy dostupné', ok: false, error: e.message });
  }
  // Test 2: Security alerty dostupné
  try {
    const count = await SecurityAlert.countDocuments();
    results.push({ test: 'Security alerty dostupné', ok: count >= 0 });
  } catch (e) {
    results.push({ test: 'Security alerty dostupné', ok: false, error: e.message });
  }
  // Test 3: Uživatelé a granularitní práva dostupné
  try {
    const user = await User.findOne();
    results.push({ test: 'Uživatelé a granularitní práva dostupné', ok: !!user });
  } catch (e) {
    results.push({ test: 'Uživatelé a granularitní práva dostupné', ok: false, error: e.message });
  }
  // Test 4: Governance report generovatelný
  try {
    const report = await generateGovernanceReport();
    results.push({ test: 'Governance report generovatelný', ok: !!report && !!report.summary });
  } catch (e) {
    results.push({ test: 'Governance report generovatelný', ok: false, error: e.message });
  }
  // Test 5: Predikce rizika incidentů funguje
  try {
    const pred = await predictIncidentRisk();
    results.push({ test: 'Predikce rizika incidentů funguje', ok: !!pred && !!pred.riskLevel });
  } catch (e) {
    results.push({ test: 'Predikce rizika incidentů funguje', ok: false, error: e.message });
  }
  // Výsledek
  const allOk = results.every(r => r.ok);
  return {
    testedAt: new Date(),
    allOk,
    results
  };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await governanceSelfTest();
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  });
}

module.exports = governanceSelfTest;
