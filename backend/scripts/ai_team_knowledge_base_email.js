// backend/scripts/ai_team_knowledge_base_email.js
// AI-driven export týmového knowledge base e-mailem vedení/týmu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_MD = path.join(REPORTS_DIR, `ai_team_knowledge_base_email-${new Date().toISOString().slice(0,10)}.md`);
const EMAIL_TO = process.env.KNOWLEDGE_BASE_EMAIL_TO;
const EMAIL_FROM = process.env.KNOWLEDGE_BASE_EMAIL_FROM;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function emailKnowledgeBase() {
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  if (!knowledgeBase) throw new Error('Chybí týmový knowledge base report.');
  fs.writeFileSync(OUT_MD, knowledgeBase);
  if (!EMAIL_TO || !EMAIL_FROM || !SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error('Chybí SMTP/email konfigurace.');
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  await transporter.sendMail({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: 'Týmový knowledge base report (ServisKol)',
    text: knowledgeBase,
    attachments: [{ filename: path.basename(OUT_MD), path: OUT_MD }]
  });
  console.log(`Knowledge base report odeslán e-mailem na ${EMAIL_TO}`);
}

if (require.main === module) {
  emailKnowledgeBase().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { emailKnowledgeBase };
