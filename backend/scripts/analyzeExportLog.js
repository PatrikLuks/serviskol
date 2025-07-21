const nodemailer = require('nodemailer');
const https = require('https');

// Email notifikace
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});
const notifyEmail = process.env.NOTIFY_EMAIL || 'admin@example.com';
function sendErrorEmail(subject, text) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@example.com',
    to: notifyEmail,
    subject,
    text
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Chyba při odesílání emailu:', error);
    } else {
      console.log('Notifikační email odeslán:', info.response);
    }
  });
}

// Slack notifikace
const slackWebhook = process.env.SLACK_WEBHOOK_URL;
function sendSlackNotification(text) {
  if (!slackWebhook) return;
  const data = JSON.stringify({ text });
  const url = new URL(slackWebhook);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  const req = https.request(options, res => {
    res.on('data', () => {});
  });
  req.on('error', error => {
    console.error('Chyba při odesílání Slack notifikace:', error);
  });
  req.write(data);
  req.end();
}
// Analýza export.log a generování statistik exportů
const fs = require('fs');
const path = require('path');

const { spawn } = require('child_process');
const logPath = path.join(__dirname, '../reports/export.log');
const statsPath = path.join(__dirname, '../reports/export-stats.json');

let success = 0;
let fail = 0;
let lastError = '';
let lastSuccess = '';
const dailyStats = {};

if (fs.existsSync(logPath)) {
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  lines.forEach(line => {
    const date = line.slice(0, 10); // YYYY-MM-DD
    if (!dailyStats[date]) dailyStats[date] = { success: 0, fail: 0 };
    if (line.includes('úspěšně nahrán na S3')) {
      success++;
      lastSuccess = line;
      dailyStats[date].success++;
    }
    if (line.includes('Chyba při uploadu')) {
      fail++;
      lastError = line;
      dailyStats[date].fail++;
    }
  });
  console.log('DEBUG dailyStats:', dailyStats);
}

// Alert logika: více než 3 selhání za posledních 7 dní
const today = new Date();
let recentFails = 0;
Object.entries(dailyStats).forEach(([date, val]) => {
  const d = new Date(date);
  const diff = (today - d) / (1000 * 60 * 60 * 24);
  if (diff <= 7) recentFails += val.fail;
});
const alertActive = recentFails > 3;
if (alertActive) {
  const msg = `ALERT: Za posledních 7 dní bylo zaznamenáno ${recentFails} selhání exportů!`;
  sendErrorEmail('Export Alert – Serviskol', msg);
  sendSlackNotification(`❌ ${msg}`);
  // Generování auditního reportu
  const failures = [];
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    lines.forEach(line => {
      const date = line.slice(0, 10);
      const d = new Date(date);
      const diff = (today - d) / (1000 * 60 * 60 * 24);
      if (diff <= 7 && line.includes('Chyba při uploadu')) {
        failures.push(line);
      }
    });
  }
  const reportPath = path.join(__dirname, '../reports/export-failures-report.txt');
  // AI shrnutí a doporučení
  let aiSummary = '\n\nAI shrnutí a doporučení:\n';
  if (failures.length === 0) {
    aiSummary += 'Žádná selhání exportů za posledních 7 dní.';
  } else {
    const repeated = failures.filter(f => f.includes('ECONNREFUSED')).length;
    if (repeated > 2) {
      aiSummary += `Opakované chyby ECONNREFUSED (${repeated}x). Doporučujeme zkontrolovat síťové připojení a dostupnost S3 endpointu.`;
    } else if (failures.some(f => f.includes('CredentialsError'))) {
      aiSummary += 'Chyby s AWS credentials. Zkontrolujte nastavení přístupových údajů v prostředí.';
    } else {
      aiSummary += 'Doporučujeme detailní analýzu logů a kontaktovat technickou podporu.';
    }
    // Predikce trendu selhání + časové vzory
    const failCounts = Object.values(dailyStats).map(d => d.fail);
    const avg = failCounts.length ? failCounts.reduce((a,b) => a+b,0)/failCounts.length : 0;
    const lastFail = failCounts[failCounts.length-1] || 0;
    if (lastFail > avg && lastFail > 0) {
      aiSummary += `\nPredikce: Riziko dalšího selhání je zvýšené (poslední den: ${lastFail}, průměr: ${avg.toFixed(2)}). Doporučujeme preventivní kontrolu systému.`;
    } else {
      aiSummary += `\nPredikce: Riziko dalšího selhání je nízké (poslední den: ${lastFail}, průměr: ${avg.toFixed(2)}).`;
    }
    // Detekce časových vzorů
    const dayTypeMap = {};
    failures.forEach(f => {
      const date = f.slice(0,10);
      const day = new Date(date).getDay();
      const type = f.includes('ECONNREFUSED') ? 'ECONNREFUSED' : f.includes('CredentialsError') ? 'CredentialsError' : 'Other';
      const key = `${day}-${type}`;
      dayTypeMap[key] = (dayTypeMap[key] || 0) + 1;
    });
    const repeatedPatterns = Object.entries(dayTypeMap).filter(([k,v]) => v > 1);
    if (repeatedPatterns.length) {
      aiSummary += '\nDetekovány opakované typy chyb ve stejný den v týdnu:';
      repeatedPatterns.forEach(([k,v]) => {
        const [day, type] = k.split('-');
        aiSummary += `\n- Den: ${['Ne','Po','Út','St','Čt','Pá','So'][day]}, Typ: ${type}, Výskyt: ${v}`;
      });
      aiSummary += '\nDoporučujeme detailní analýzu infrastruktury v daný den.';
    }
    // Příprava pro eskalaci alertů
    if (lastFail > avg && lastFail > 0 && repeatedPatterns.length) {
      aiSummary += '\nEskalace: Kritické opakované selhání – doporučujeme okamžitou eskalaci na technickou podporu.';
    }
  }
  const reportContent = `Auditní report selhání exportů (posledních 7 dní)\nPočet selhání: ${failures.length}\n\n${failures.join('\n')}${aiSummary}`;
  fs.writeFileSync(reportPath, reportContent);
  console.log('Auditní report selhání exportů vygenerován:', reportPath);
}
   // Pokud je potřeba eskalace, odešli SMS alert
let escalationNeeded = false;
let escalationReason = '';
// Detekce kritických alertů (např. opakované selhání exportu)
// Pokud je potřeba eskalace, nastav proměnné
// (přidej logiku podle AI analýzy nebo počtu selhání)
if (fail > 2) {
  escalationNeeded = true;
  escalationReason = `Opakované selhání exportu (${fail}x za posledních 7 dní)`;
}
if (escalationNeeded) {
  const smsMessage = `Kritický alert Serviskol: ${escalationReason}. Okamžitě zkontrolujte systém.`;
  const smsScript = path.join(__dirname, 'sendCriticalAlertSms.js');
  const child = spawn('node', [smsScript, smsMessage], {
    stdio: 'inherit',
    env: process.env
  });
  child.on('error', err => {
    console.error('Chyba při spouštění SMS alert skriptu:', err);
  });

  // Automatické vytvoření incidentu v ServiceNow
  const incidentScript = path.join(__dirname, 'createIncidentServiceNow.js');
  const incidentShort = 'Kritický alert: Opakované selhání exportů v Serviskol';
  const incidentDesc = escalationReason || 'Systém detekoval opakované selhání exportů.';
  const incidentChild = spawn('node', [incidentScript, incidentShort, incidentDesc], {
    stdio: 'inherit',
    env: process.env
  });
  incidentChild.on('error', err => {
    console.error('Chyba při spouštění ServiceNow incident skriptu:', err);
  });
}

const stats = {
  total: success + fail,
  success,
  fail,
  lastSuccess,
  lastError,
  daily: dailyStats,
  alert: alertActive,
  recentFails,
  timestamp: new Date().toISOString()
};

try {
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  console.log('Statistiky exportů vygenerovány:', statsPath);
} catch (err) {
  console.error('Chyba při zápisu statistik:', err);
}
