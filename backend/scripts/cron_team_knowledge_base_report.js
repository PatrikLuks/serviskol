// Automatizovaný workflow: generování, export a distribuce týmového knowledge base reportu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const nodemailer = require('nodemailer');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `team_knowledge_base-latest.md`);
const PDF_PATH = path.join(REPORTS_DIR, `team_knowledge_base-latest.pdf`);
const EMAIL_TO = process.env.REPORT_EMAIL_TO || 'management@serviskol.cz';
const EMAIL_FROM = process.env.REPORT_EMAIL_FROM || 'noreply@serviskol.cz';
const SMTP_URL = process.env.SMTP_URL;

function sendAlert(subject, text) {
  // Zde lze doplnit Slack/SIEM alert
  console.error(subject, text);
}

async function main() {
  if (!OPENAI_API_KEY) {
    sendAlert('Chybí OPENAI_API_KEY', 'Doplňte klíč do .env');
    process.exit(1);
  }
  try {
    // 1. Generování reportu
    execSync('node backend/scripts/ai_team_knowledge_base_report.js', { stdio: 'inherit' });
    if (!fs.existsSync(OUT_PATH)) throw new Error('Report nebyl vygenerován');
    // 2. Export do PDF
    execSync('node backend/scripts/ai_team_knowledge_base_export.js', { stdio: 'inherit' });
    if (!fs.existsSync(PDF_PATH)) throw new Error('PDF nebylo vygenerováno');
    // 3. Odeslání e-mailem
    if (!SMTP_URL) throw new Error('Chybí SMTP_URL v .env');
    const transporter = nodemailer.createTransport(SMTP_URL);
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: 'Týmový knowledge base report',
      text: 'V příloze najdete aktuální týmový report.',
      attachments: [{ filename: 'team_knowledge_base-latest.pdf', path: PDF_PATH }]
    });
    console.log('Report byl úspěšně odeslán e-mailem.');
  } catch (e) {
    sendAlert('Chyba v automatizaci knowledge base reportu', e.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
