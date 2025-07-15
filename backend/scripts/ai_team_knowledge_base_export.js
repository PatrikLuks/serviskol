// backend/scripts/ai_team_knowledge_base_export.js
// AI-driven export týmového knowledge base do PDF a Markdown pro archivaci a sdílení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_MD = path.join(REPORTS_DIR, `ai_team_knowledge_base_export-${new Date().toISOString().slice(0,10)}.md`);
const OUT_PDF = path.join(REPORTS_DIR, `ai_team_knowledge_base_export-${new Date().toISOString().slice(0,10)}.pdf`);

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function exportKnowledgeBase() {
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  if (!knowledgeBase) throw new Error('Chybí týmový knowledge base report.');
  fs.writeFileSync(OUT_MD, knowledgeBase);
  await new Promise((resolve, reject) => {
    markdownpdf().from.string(knowledgeBase).to(OUT_PDF, err => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log(`Knowledge base exportován do ${OUT_MD} a ${OUT_PDF}`);
}

if (require.main === module) {
  exportKnowledgeBase().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { exportKnowledgeBase };
