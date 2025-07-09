const { sendWeeklyReport } = require('../utils/reportUtils');

// Spustit ručně: node scripts/sendWeeklyReport.js
(async () => {
  await sendWeeklyReport();
  console.log('Týdenní report odeslán adminům.');
})();
