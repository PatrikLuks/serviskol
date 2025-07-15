// backend/scripts/export_onboarding_report.js
// Export onboarding reportu do Markdown

const fs = require('fs');
const path = require('path');
const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function exportMarkdown() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();

  let md = `# Onboarding Report\n\n`;
  md += `## Trendy a slabiny\n`;
  md += `- Celkem feedbacků: ${trends.totalFeedback}\n`;
  md += `- Počet problémů: ${trends.problemCount}\n`;
  md += `- Lessons learned: ${trends.lessonCount}\n`;
  md += `\n### Doporučení:\n`;
  trends.recommendations.forEach(r => { md += `- ${r}\n`; });
  md += `\n## Dopad onboarding inovací\n`;
  md += `- Produktivita: ${impact.productivityScore}%\n`;
  md += `- Spokojenost: ${impact.satisfactionScore}%\n`;
  md += `- Rychlost zapracování: ${impact.speedScore}%\n`;
  md += `\n---\n`;
  md += `### Feedbacky\n`;
  trends.feedbacks.forEach(f => { md += `- ${f}\n`; });
  md += `\n### Lessons learned\n`;
  trends.lessons.forEach(l => { md += `- ${l}\n`; });

  // Uložení do souboru
  const outPath = path.join(__dirname, '../reports/onboarding_report-latest.md');
  fs.writeFileSync(outPath, md, 'utf-8');
  return outPath;
}

module.exports = { exportMarkdown };
