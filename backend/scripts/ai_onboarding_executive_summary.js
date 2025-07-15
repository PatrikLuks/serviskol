// backend/scripts/ai_onboarding_executive_summary.js
// AI-driven onboarding executive summary: klíčové metriky, trendy, incidenty, compliance, doporučení

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');
const { detectIncidents } = require('./ai_onboarding_incident_management');
const { getComplianceReport } = require('./ai_onboarding_compliance_check');

function generateExecutiveSummary() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();
  const incidents = detectIncidents();
  const compliance = getComplianceReport();

  let summary = `# Onboarding Executive Summary\n\n`;
  summary += `## Klíčové metriky\n`;
  summary += `- Produktivita nových členů: ${impact.productivityScore}%\n`;
  summary += `- Spokojenost: ${impact.satisfactionScore}%\n`;
  summary += `- Rychlost zapracování: ${impact.speedScore}%\n`;
  summary += `- Počet problémů: ${trends.problemCount}\n`;
  summary += `\n## Trendy\n`;
  summary += `- Lessons learned: ${trends.lessonCount}\n`;
  summary += `- Doporučení: ${trends.recommendations.join('; ')}\n`;
  summary += `\n## Incidenty\n`;
  summary += incidents.incidents.length > 0 ? incidents.incidents.map(i => `- ${i}\n`).join('') : '- Žádné kritické incidenty\n';
  summary += `\n## Compliance\n`;
  summary += compliance.checks.map(c => `- ${c.name}: ${c.status ? 'OK' : 'Nesplněno'}\n`).join('');
  if (compliance.recommendations.length > 0) {
    summary += `\nDoporučení k nápravě: ${compliance.recommendations.join('; ')}\n`;
  }
  summary += `\n## Doporučení pro management\n`;
  summary += incidents.recommendations.length > 0 ? incidents.recommendations.map(r => `- ${r}\n`).join('') : '- Onboarding proces je stabilní\n';

  return summary;
}

module.exports = { generateExecutiveSummary };
