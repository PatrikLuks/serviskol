// backend/scripts/ai_check_action_items.js
// AI skript pro kontrolu plnění doporučení z auditů, retrospektiv a lessons learned
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sendSlackNotification } = require('../utils/slackNotifier');
const nodemailer = require('nodemailer');
// Nastavení e-mailu (lze upravit podle potřeby nebo načítat z .env)
const EMAIL_TO = process.env.CRITICAL_EMAIL_TO || 'admin@serviskol.local';
const EMAIL_FROM = process.env.CRITICAL_EMAIL_FROM || 'serviskol-alert@serviskol.local';
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 25;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

function sendEmailNotification(subject, text) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter.sendMail({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject,
    text,
  });
}

// Cesty k reportům a checklistům
const REPORTS_DIR = path.join(__dirname, '../reports');
const LESSONS_LEARNED_PATH = path.join(__dirname, '../onboarding-lessons-learned.md');
const RETROSPECTIVE_DIR = path.join(__dirname, '../retrospectives');
const AUDIT_CHECKLIST_PATH = path.join(__dirname, '../../MONITORING_ALERTING_AUDIT_CHECKLIST.md');

function findUnrealizedActions(text) {
  // Jednoduchá heuristika: hledej body, které nejsou odškrtnuté nebo mají poznámku TODO
  const lines = text.split('\n');
  return lines.filter(l => (/^- \[ ?\]/.test(l) || /TODO|nedokončeno|neřešeno|kritické/i.test(l)));
}

async function main() {
  let critical = [];
  // Načti lessons learned
  if (fs.existsSync(LESSONS_LEARNED_PATH)) {
    const ll = fs.readFileSync(LESSONS_LEARNED_PATH, 'utf-8');
    critical = critical.concat(findUnrealizedActions(ll));
  }
  // Načti audit checklist
  if (fs.existsSync(AUDIT_CHECKLIST_PATH)) {
    const audit = fs.readFileSync(AUDIT_CHECKLIST_PATH, 'utf-8');
    critical = critical.concat(findUnrealizedActions(audit));
  }
  // Projdi retrospektivy
  if (fs.existsSync(RETROSPECTIVE_DIR)) {
    const files = fs.readdirSync(RETROSPECTIVE_DIR).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const txt = fs.readFileSync(path.join(RETROSPECTIVE_DIR, f), 'utf-8');
      critical = critical.concat(findUnrealizedActions(txt));
    }
  }
  // Projdi reports
  if (fs.existsSync(REPORTS_DIR)) {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const txt = fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8');
      critical = critical.concat(findUnrealizedActions(txt));
    }
  }
  // Filtrování duplicit
  critical = [...new Set(critical)].filter(Boolean);

  const logPath = path.join(__dirname, '../logs/critical_action_items.log');
  const timestamp = new Date().toISOString();
  if (critical.length > 0) {
    const message = `Kritické nerealizované úkoly:\n${critical.join('\n')}`;
    // Slack notifikace
    await sendSlackNotification({
      text: message,
      channel: process.env.SLACK_CRITICAL_CHANNEL || '#alerts'
    });
    // E-mail notifikace
    try {
      await sendEmailNotification('Kritické nerealizované úkoly (ServisKol)', message);
      console.log('Eskalace: E-mail odeslán.');
    } catch (e) {
      console.error('Chyba při odesílání e-mailu:', e.message);
    }
    // Logování do souboru
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    console.log('Eskalace: Slack alert odeslán.');
  } else {
    const msg = `[${timestamp}] Všechny akční kroky jsou realizovány nebo nejsou kritické.\n`;
    fs.appendFileSync(logPath, msg);
    console.log('Všechny akční kroky jsou realizovány nebo nejsou kritické.');
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
