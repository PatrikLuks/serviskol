const fs = require('fs');
const path = require('path');
const { alertAdmins } = require('../utils/notificationUtils');

function auditLog(action, user, details = {}) {
  const logPath = path.join(__dirname, '../logs/audit.log');
  const entry = {
    timestamp: new Date().toISOString(),
    userId: user?.id || user?._id || null,
    email: user?.email || null,
    action,
    details
  };
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

// Například: alert při více než 3 exportech dat za den
async function checkExportAlerts(user) {
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, '../logs/audit.log');
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const today = new Date().toISOString().slice(0, 10);
  const exportsToday = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => l.action === 'Export dat' && l.timestamp.startsWith(today));
  if (exportsToday.length > 3) {
    await alertAdmins({
      subject: 'ALERT: Nadměrný export dat',
      text: `Za dnešní den bylo provedeno ${exportsToday.length} exportů dat. Prověřte případné zneužití.`
    });
  }
}

module.exports = { auditLog, checkExportAlerts };
