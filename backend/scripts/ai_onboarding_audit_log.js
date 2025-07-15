// backend/scripts/ai_onboarding_audit_log.js
// AI-driven onboarding audit log: akce, změny, incidenty, doporučení, zásahy

const fs = require('fs');
const path = require('path');

function getAuditLog() {
  // Simulace: načtení logu ze souboru
  const logPath = path.join(__dirname, '../logs/onboarding_audit.log');
  let log = [];
  if (fs.existsSync(logPath)) {
    log = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  } else {
    // Pokud log neexistuje, vygeneruj ukázková data
    log = [
      '[2025-07-01] Vytvořen onboarding checklist pro uživatele.',
      '[2025-07-02] Zaznamenána zpětná vazba: "problém s přístupem".',
      '[2025-07-03] AI doporučení: aktualizovat onboarding dokumentaci.',
      '[2025-07-04] Incident: opakované selhání onboarding úkolu.',
      '[2025-07-05] Eskalace: informován management.',
      '[2025-07-06] Audit: export reportu do S3.',
    ];
  }
  return log;
}

module.exports = { getAuditLog };
