// backend/scripts/ai_onboarding_retrospective.js
// AI generování retrospektivy onboarding procesu

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function generateRetrospective() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();

  let summary = `# Onboarding Retrospektiva\n\n`;
  summary += `## Shrnutí\n`;
  summary += `- Celkem feedbacků: ${trends.totalFeedback}\n`;
  summary += `- Počet problémů: ${trends.problemCount}\n`;
  summary += `- Lessons learned: ${trends.lessonCount}\n`;
  summary += `- Produktivita: ${impact.productivityScore}%\n`;
  summary += `- Spokojenost: ${impact.satisfactionScore}%\n`;
  summary += `- Rychlost zapracování: ${impact.speedScore}%\n`;
  summary += `\n## Úspěchy\n`;
  if (impact.productivityScore > 70) summary += `- Vysoká produktivita nových členů\n`;
  if (impact.satisfactionScore > 70) summary += `- Vysoká spokojenost s onboardingem\n`;
  if (impact.speedScore > 70) summary += `- Rychlé zapracování nových členů\n`;
  summary += `\n## Slabiny\n`;
  if (trends.problemCount > 0) summary += `- Opakované problémy: ${trends.problemCount}\n`;
  if (trends.lessonCount > 5) summary += `- Potřeba častější aktualizace lessons learned\n`;
  summary += `\n## Doporučené akční kroky\n`;
  trends.recommendations.forEach(r => { summary += `- ${r}\n`; });
  summary += `\n---\n`;
  summary += `### Lessons learned\n`;
  trends.lessons.forEach(l => { summary += `- ${l}\n`; });

  return summary;
}

module.exports = { generateRetrospective };
