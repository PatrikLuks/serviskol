// ai-whatif-simulation.js
// Simulace dopadů změn incidentů/práv na governance a doporučení AI

const generateGovernanceReport = require('./ai-governance-report');
const predictIncidentRisk = require('./ai-incident-risk-predictor');

/**
 * Simuluje dopad změny počtu incidentů a změn práv na governance a doporučení
 * @param {Object} opts { incidentDelta: number, userChangeDelta: number }
 */
async function simulateWhatIf({ incidentDelta = 0, userChangeDelta = 0 } = {}) {
  // Získej aktuální governance report a predikci
  const governance = await generateGovernanceReport();
  const risk = await predictIncidentRisk();

  // Simuluj změny
  const simulated = { ...governance };
  simulated.summary = { ...governance.summary };
  simulated.summary.securityAlertCount += incidentDelta;
  simulated.summary.userChangeCount += userChangeDelta;

  // Heuristická AI doporučení
  const recommendations = [];
  if (simulated.summary.securityAlertCount > governance.summary.securityAlertCount * 1.5) {
    recommendations.push('Simulace: Výrazný nárůst incidentů – doporučujeme okamžitý audit a omezení přístupů.');
  }
  if (simulated.summary.userChangeCount > governance.summary.userChangeCount * 1.5) {
    recommendations.push('Simulace: Zvýšený počet změn práv – doporučujeme zpřísnit schvalování a monitoring.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Simulace: Governance zůstává stabilní, nejsou detekovány zásadní anomálie.');
  }

  return {
    simulatedAt: new Date(),
    incidentDelta,
    userChangeDelta,
    simulatedSummary: simulated.summary,
    originalSummary: governance.summary,
    riskLevel: risk.riskLevel,
    recommendations
  };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await simulateWhatIf({ incidentDelta: 5, userChangeDelta: 2 });
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  });
}

module.exports = simulateWhatIf;
