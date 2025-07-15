// backend/scripts/ai_onboarding_healthcheck.js
// AI healthcheck onboarding procesu: stav, rizika, urgentní doporučení

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function getHealthcheck() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();
  let status = 'OK';
  let risks = [];
  let urgent = [];

  if (trends.problemCount > 3 || impact.productivityScore < 50 || impact.satisfactionScore < 50) {
    status = 'Riziko!';
    risks.push('Vysoký počet problémů v onboarding procesu.');
    if (impact.productivityScore < 50) risks.push('Nízká produktivita nových členů.');
    if (impact.satisfactionScore < 50) risks.push('Nízká spokojenost s onboardingem.');
    urgent.push('Okamžitě zorganizujte onboarding workshop.');
    urgent.push('Zajistěte mentoring pro všechny nové členy.');
    urgent.push('Aktualizujte lessons learned a best practices.');
  } else if (trends.problemCount > 0) {
    status = 'Pozor!';
    risks.push('Objevují se opakované problémy v onboarding procesu.');
    urgent.push('Zaměřte se na řešení konkrétních slabin.');
  }

  return {
    status,
    risks,
    urgent,
    summary: `Produktivita: ${impact.productivityScore}%, Spokojenost: ${impact.satisfactionScore}%, Problémy: ${trends.problemCount}`,
  };
}

module.exports = { getHealthcheck };
