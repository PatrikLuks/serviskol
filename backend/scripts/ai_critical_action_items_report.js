const MD_REPORT_PATH = path.join(__dirname, '../reports/critical_action_items_summary.md');
// backend/scripts/ai_critical_action_items_report.js
// Skript pro generování reportu z logs/critical_action_items.log
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../logs/critical_action_items.log');

function parseLog(logText) {
  const entries = logText.split(/\n(?=\[)/).filter(Boolean);
  const stats = {};
  entries.forEach(entry => {
    const dateMatch = entry.match(/\[(.*?)\]/);
    const date = dateMatch ? dateMatch[1].slice(0, 10) : 'unknown';
    const items = entry.match(/Kritické nerealizované úkoly:\n([\s\S]*)/);
    if (items) {
      const lines = items[1].split('\n').filter(Boolean);
      lines.forEach(line => {
        stats[line] = (stats[line] || 0) + 1;
      });
    }
  });
  return stats;
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.log('Log kritických úkolů neexistuje.');
    return;
  }
  const logText = fs.readFileSync(LOG_PATH, 'utf-8');
  const stats = parseLog(logText);
  const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  // Textový report do konzole
  console.log('Report – nejčastější kritické nerealizované úkoly:');
  sorted.forEach(([item, count]) => {
    console.log(`- ${item} (${count}×)`);
  });

  // Markdown report pro retrospektivu
  let md = '# Souhrn kritických nerealizovaných úkolů\n\n';
  if (sorted.length === 0) {
    md += 'Žádné kritické nerealizované úkoly za sledované období.\n';
  } else {
    md += 'Nejčastější opakující se slabiny:\n';
    sorted.forEach(([item, count]) => {
      md += `- ${item} (**${count}×**)\n`;
    });
  }
  fs.writeFileSync(MD_REPORT_PATH, md);
  console.log(`Markdown report vygenerován: ${MD_REPORT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
