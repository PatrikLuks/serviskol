// siem-exporter.js
// Export alertů a audit logů do externího SIEM/SOC přes webhook

const axios = require('axios');
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

const SIEM_WEBHOOK_URL = process.env.SIEM_WEBHOOK_URL;

async function exportToSIEM({ type = 'alerts', from, to } = {}) {
  if (!SIEM_WEBHOOK_URL) throw new Error('SIEM_WEBHOOK_URL není nastaveno');
  let data = [];
  if (type === 'alerts') {
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    data = await SecurityAlert.find(filter).lean();
  } else if (type === 'audit') {
    const filter = {};
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    data = await AuditLog.find(filter).lean();
  }
  const res = await axios.post(SIEM_WEBHOOK_URL, { type, data });
  return { sent: data.length, status: res.status };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await exportToSIEM({ type: 'alerts' });
    console.log(result);
    process.exit(0);
  });
}

module.exports = exportToSIEM;
