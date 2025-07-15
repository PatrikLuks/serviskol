// Automatizované generování retrospektivního reportu a lessons learned
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `retrospective-${new Date().toISOString().slice(0,10)}.md`);

function getIncidentReports(n = 12) {
  // posledních 12 reportů = cca kvartál při týdenní frekvenci
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('incident_report-') && f.endsWith('.md') && !f.includes('latest'))
    .sort()
    .slice(-n);
  return files.map(f => ({ name: f, content: fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8') }));
}

function getAIInsights(n = 12) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('ai_insight-') && f.endsWith('.md'))
    .sort()
    .slice(-n);
  return files.map(f => ({ name: f, content: fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8') }));
}

function generateRetrospective() {
  const incidents = getIncidentReports();
  const insights = getAIInsights();
  let md = `# Kvartální retrospektiva & Lessons Learned\n\n`;
  md += `## Shrnutí incidentů (poslední kvartál)\n`;
  incidents.forEach(r => {
    md += `### ${r.name}\n`;
    md += r.content.split('\n').slice(0, 15).join('\n') + '\n\n';
  });
  md += `\n## AI Insight & Prediction\n`;
  insights.forEach(i => {
    md += `### ${i.name}\n`;
    md += i.content + '\n';
  });
  md += `\n## Lessons Learned\n`;
  md += `- Nejčastější typy incidentů a alertů\n- Trendy v selháních a doporučení AI\n- Opatření, která byla zavedena\n- Doporučení pro další kvartál\n`;
  md += `\n> Tento report je generován automaticky. Pro detailní analýzu viz jednotlivé reporty a AI insighty.\n`;
  return md;
}

if (require.main === module) {
  fs.writeFileSync(OUT_PATH, generateRetrospective());
  console.log(`Retrospektivní report uložen do ${OUT_PATH}`);
}

module.exports = { generateRetrospective };
