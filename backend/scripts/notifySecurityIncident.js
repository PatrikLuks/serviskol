// Automatizovaná notifikace a eskalace bezpečnostního incidentu na základě AI analýzy
// Odesílá e-mail managementu a volitelně vytvoří ServiceNow incident

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const REPORT_PATH = path.resolve(__dirname, '../reports/ai_security_analysis.md');
const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL || 'management@example.com';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

function containsCriticalFinding(text) {
  // Jednoduchá detekce závažného nálezu (lze rozšířit)
  return /kritick|vážn|incident|průnik|útok|leak|ztráta|kompromitace/i.test(text);
}

async function sendEmail(subject, body) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Chybí SMTP konfigurace v prostředí.');
    return;
  }
  let transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
  await transporter.sendMail({
    from: SMTP_USER,
    to: MANAGEMENT_EMAIL,
    subject,
    text: body
  });
  console.log('Notifikace odeslána na', MANAGEMENT_EMAIL);
}

async function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('Chybí AI bezpečnostní report:', REPORT_PATH);
    process.exit(1);
  }
  const report = fs.readFileSync(REPORT_PATH, 'utf8');
  const subject = containsCriticalFinding(report)
    ? 'KRITICKÝ bezpečnostní incident – AI analýza'
    : 'Bezpečnostní report – AI analýza';
  await sendEmail(subject, report);
  // Volitelně: eskalace do ServiceNow
  if (containsCriticalFinding(report) && process.env.SERVICENOW_INSTANCE) {
    const { execSync } = require('child_process');
    try {
      execSync(`node scripts/createIncidentServiceNow.js "${subject}" "${report.substring(0, 500)}..."`);
      console.log('Incident eskalován do ServiceNow.');
    } catch (e) {
      console.error('Eskalace do ServiceNow selhala:', e.message);
    }
  }
}

if (require.main === module) {
  main();
}
