// backend/scripts/ai_team_knowledge_base_siem_export.js
// AI-driven export týmového knowledge base do SIEM/SOC pro compliance a bezpečnostní monitoring
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const REPORTS_DIR = path.join(__dirname, '../reports');
const SIEM_ENDPOINT = process.env.SIEM_ENDPOINT;
const SIEM_TOKEN = process.env.SIEM_TOKEN;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function exportToSIEM() {
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  if (!knowledgeBase) throw new Error('Chybí týmový knowledge base report.');
  if (!SIEM_ENDPOINT || !SIEM_TOKEN) throw new Error('Chybí SIEM konfigurace.');
  await axios.post(SIEM_ENDPOINT, {
    type: 'team_knowledge_base',
    content: knowledgeBase,
    timestamp: new Date().toISOString()
  }, {
    headers: { 'Authorization': `Bearer ${SIEM_TOKEN}` }
  });
  console.log(`Knowledge base exportován do SIEM/SOC: ${SIEM_ENDPOINT}`);
}

if (require.main === module) {
  exportToSIEM().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { exportToSIEM };
