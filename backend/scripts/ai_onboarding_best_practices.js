// backend/scripts/ai_onboarding_best_practices.js
// AI generování aktuálních best practices pro onboarding proces

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function generateBestPractices() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();
  let practices = [];

  // Základní best practices
  practices.push('Pravidelně aktualizujte onboarding checklisty podle lessons learned.');
  practices.push('Zajišťujte mentoring pro nové členy v prvním týdnu.');
  practices.push('Sbírejte a analyzujte zpětnou vazbu od nových členů.');
  practices.push('Zveřejňujte lessons learned v dashboardu pro celý tým.');

  // Dynamické doporučení podle trendů
  if (trends.problemCount > 2) {
    practices.push('Zaměřte se na řešení opakovaných problémů v onboarding procesu.');
  }
  if (impact.productivityScore < 60) {
    practices.push('Zlepšete dokumentaci a onboarding workflow pro zvýšení produktivity.');
  }
  if (impact.satisfactionScore < 60) {
    practices.push('Zajistěte pravidelné check-iny s novými členy pro zvýšení spokojenosti.');
  }

  return practices;
}

module.exports = { generateBestPractices };
