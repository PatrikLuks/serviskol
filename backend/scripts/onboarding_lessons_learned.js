// Automatizované generování onboarding lessons learned dokumentu
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(__dirname, '../onboarding-lessons-learned.md');

function getLatestRetrospective() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('retrospective-') && f.endsWith('.md'))
    .sort();
  if (!files.length) return null;
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function getLatestAIInsight() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('ai_insight-') && f.endsWith('.md'))
    .sort();
  if (!files.length) return null;
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function getLatestIncidentReport() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('incident_report-') && f.endsWith('.md') && !f.includes('latest'))
    .sort();
  if (!files.length) return null;
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function generateOnboardingDoc() {
  const retro = getLatestRetrospective();
  const ai = getLatestAIInsight();
  const incident = getLatestIncidentReport();
  let md = `# Lessons Learned & Incident Insights (Onboarding)\n\n`;
  md += `> Tento dokument je generován automaticky z poslední retrospektivy, AI insightu a incident reportu.\n\n`;
  if (retro) {
    md += `## Shrnutí poslední retrospektivy\n`;
    md += retro.split('\n').slice(0, 30).join('\n') + '\n\n';
  }
  if (ai) {
    md += `## AI Insight & Prediction\n`;
    md += ai.split('\n').slice(0, 20).join('\n') + '\n\n';
  }
  if (incident) {
    md += `## Nejnovější incident report\n`;
    md += incident.split('\n').slice(0, 20).join('\n') + '\n\n';
  }
  md += `---\nPro detailní studium viz složku reports/ a Issues se štítky ai-recommendation, retrospective.\n`;
  return md;
}

if (require.main === module) {
  fs.writeFileSync(OUT_PATH, generateOnboardingDoc());
  console.log(`Onboarding lessons learned dokument uložen do ${OUT_PATH}`);
}

module.exports = { generateOnboardingDoc };
