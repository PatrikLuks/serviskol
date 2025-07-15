// backend/scripts/ai_onboarding_actions_status.js
// Sledování a reporting stavu akčních kroků z retrospektiv

const fs = require('fs');
const path = require('path');

function getActionsStatus() {
  // Simulace: načtení poslední retrospektivy a extrakce akčních kroků
  const retroPath = path.join(__dirname, '../reports/onboarding_report-latest.md');
  let actions = [];
  if (fs.existsSync(retroPath)) {
    const content = fs.readFileSync(retroPath, 'utf-8');
    const match = content.match(/## Doporučení:[\s\S]*?\n(.*?)(\n##|$)/);
    if (match && match[1]) {
      actions = match[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, ''));
    }
  }
  // Simulace stavu: náhodně označíme některé jako splněné/nesplněné
  const status = actions.map((a, idx) => ({ action: a, done: idx % 2 === 0 }));
  const notDone = status.filter(s => !s.done);
  return {
    total: status.length,
    done: status.filter(s => s.done).length,
    notDone: notDone.length,
    actions: status,
    alert: notDone.length > 0 ? 'Některé akční kroky nejsou splněny, doporučujeme eskalaci!' : 'Všechny akční kroky jsou splněny.'
  };
}

module.exports = { getActionsStatus };
