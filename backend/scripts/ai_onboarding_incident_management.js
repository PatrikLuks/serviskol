// backend/scripts/ai_onboarding_incident_management.js
// AI-driven onboarding incident management: detekce, reporting, řešení

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function detectIncidents() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();
  let incidents = [];
  let recommendations = [];

  // Detekce incidentů
  if (trends.problemCount > 3) {
    incidents.push('Opakované onboarding problémy (více než 3 za období)');
    recommendations.push('Zorganizujte krizový onboarding workshop.');
    recommendations.push('Zajistěte mentoring pro všechny nové členy.');
  }
  if (impact.productivityScore < 50) {
    incidents.push('Nízká produktivita nových členů (<50%)');
    recommendations.push('Zlepšete onboarding dokumentaci a workflow.');
  }
  if (impact.satisfactionScore < 50) {
    incidents.push('Nízká spokojenost s onboardingem (<50%)');
    recommendations.push('Pravidelně sbírejte a analyzujte zpětnou vazbu.');
  }

  return {
    incidents,
    recommendations,
    summary: `Problémy: ${trends.problemCount}, Produktivita: ${impact.productivityScore}%, Spokojenost: ${impact.satisfactionScore}%`,
  };
}

module.exports = { detectIncidents };
