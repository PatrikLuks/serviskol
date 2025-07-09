// Skript pro měsíční export audit logů a alertů pro compliance
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const { alertAdmins } = require('../utils/notificationUtils');
const User = require('../models/User');

(async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const logPath = path.join(__dirname, '../logs/audit.log');
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  // Filtrovat záznamy za aktuální měsíc
  const monthLogs = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean)
    .filter(l => {
      const d = new Date(l.timestamp);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  // Export do souboru
  const exportPath = path.join(__dirname, `../logs/audit_export_${year}_${month}.json`);
  fs.writeFileSync(exportPath, JSON.stringify(monthLogs, null, 2));
  // Odeslat adminům e-mailem
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: `Měsíční compliance report ServisKol (${year}/${month})`,
      text: `V příloze naleznete export audit logů za měsíc ${month}/${year}.`,
      attachments: [{ filename: `audit_export_${year}_${month}.json`, path: exportPath }]
    });
  }
  await alertAdmins({ subject: 'Měsíční compliance report odeslán', text: `Audit logy za ${month}/${year} byly exportovány a rozeslány adminům.` });
  console.log('Měsíční compliance report odeslán adminům.');
})();
