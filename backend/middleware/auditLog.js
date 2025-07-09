const fs = require('fs');
const path = require('path');

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

module.exports = auditLog;
