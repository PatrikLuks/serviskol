// Skript: ai_dashboard_report.js
// Popis: Generuje HTML dashboard s vizualizací klíčových metrik a trendů z reportů projektu.

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const DASHBOARD_FILE = path.join(REPORTS_DIR, 'dashboard.html');

function parseImpactReport() {
  // Najdi poslední ai_impact_report-*.md
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_impact_report-'));
  if (!files.length) return { closed: 0, open: 0 };
  const latest = files.sort().reverse()[0];
  const content = fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf8');
  const closed = parseInt((content.match(/Uzavřené Issues.*?(\d+)/) || [])[1] || '0', 10);
  const open = parseInt((content.match(/Otevřené Issues.*?(\d+)/) || [])[1] || '0', 10);
  return { closed, open };
}

// Nové: historie pro časovou osu (trend)
function parseAuditTrendHistory() {
  // Pro jednoduchost: projdi všechny audit_trend_report.md podle data vytvoření (nebo 1x týdně)
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('audit_trend_report'))
    .map(f => ({
      file: f,
      date: fs.statSync(path.join(REPORTS_DIR, f)).mtime
    }))
    .sort((a, b) => a.date - b.date);
  const history = [];
  for (const { file, date } of files) {
    const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
    const match = content.match(/\*\*([0-9]+)\*\* \| \*\*([0-9]+)\*\* \| \*\*([0-9]+)\*\*/);
    if (match) {
      history.push({
        date: date.toISOString().slice(0, 10),
        done: parseInt(match[1], 10),
        open: parseInt(match[2], 10),
        total: parseInt(match[3], 10)
      });
    }
  }
  return history;
}

function parseAuditTrendReport() {
  const file = path.join(REPORTS_DIR, 'audit_trend_report.md');
  if (!fs.existsSync(file)) return { done: 0, open: 0, total: 0 };
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/\*\*([0-9]+)\*\* \| \*\*([0-9]+)\*\* \| \*\*([0-9]+)\*\*/);
  if (!match) return { done: 0, open: 0, total: 0 };
  return { done: parseInt(match[1], 10), open: parseInt(match[2], 10), total: parseInt(match[3], 10) };
}

function parseVoiceOfCustomer() {
  // Najdi poslední voice_of_customer_summary-*.md
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('voice_of_customer_summary-'));
  if (!files.length) return { topics: 0, positive: 0, negative: 0 };
  const latest = files.sort().reverse()[0];
  const content = fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf8');
  const topics = (content.match(/## Nejčastější témata([\s\S]*?)## /) || [])[1] || '';
  const positive = (content.match(/## Ukázky pozitivní zpětné vazby([\s\S]*?)## /) || [])[1] || '';
  const negative = (content.match(/## Ukázky negativní zpětné vazby([\s\S]*?)\n+/) || [])[1] || '';
  return {
    topics: topics.split('\n').filter(l => l.trim().length > 2).length,
    positive: positive.split('\n').filter(l => l.trim().length > 2).length,
    negative: negative.split('\n').filter(l => l.trim().length > 2).length,
  };
}

function parseMarketingCommunity() {
  // Najdi poslední marketing_community_summary-*.md
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('marketing_community_summary-'));
  if (!files.length) return { open: 0, closed: 0 };
  const latest = files.sort().reverse()[0];
  const content = fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf8');
  const open = (content.match(/- \[ \]/g) || []).length;
  const closed = (content.match(/- \[x\]/gi) || []).length;
  return { open, closed };
}

function renderDashboard(impact, audit, trendHistory, voc, marketing) {
  // SVG line chart pro trend
  let svgTrend = '';
  if (trendHistory.length > 1) {
    const w = 400, h = 120, pad = 30;
    const maxTotal = Math.max(...trendHistory.map(d => d.total));
    const points = trendHistory.map((d, i) => {
      const x = pad + i * ((w - 2 * pad) / (trendHistory.length - 1));
      const y = h - pad - (d.done / (maxTotal || 1)) * (h - 2 * pad);
      return `${x},${y}`;
    }).join(' ');
    svgTrend = `
      <svg width="${w}" height="${h}">
        <rect x="${pad}" y="${pad}" width="${w - 2 * pad}" height="${h - 2 * pad}" fill="#e6fbe6" stroke="#228b22" stroke-width="2"/>
        <polyline points="${points}" fill="none" stroke="#228b22" stroke-width="3"/>
        ${trendHistory.map((d, i) => {
          const x = pad + i * ((w - 2 * pad) / (trendHistory.length - 1));
          const y = h - pad - (d.done / (maxTotal || 1)) * (h - 2 * pad);
          return `<circle cx="${x}" cy="${y}" r="4" fill="#228b22"/>
            <text x="${x}" y="${h - 5}" font-size="10" text-anchor="middle">${d.date.slice(5)}</text>`;
        }).join('')}
      </svg>
      <div style="font-size:0.9em;color:#666;">Osa Y: splněno z celkového počtu, Osa X: čas (týdny)</div>
    `;
  }
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>ServisKol – Strategický dashboard</title>
  <style>
    body { font-family: sans-serif; background: #f6fff6; color: #222; }
    h1 { color: #228b22; }
    .metrics { display: flex; gap: 2em; margin-bottom: 2em; flex-wrap: wrap; }
    .metric { background: #e6fbe6; border-radius: 8px; padding: 1em 2em; box-shadow: 0 2px 8px #0001; min-width: 220px; }
    .chart { margin: 2em 0; }
    .export-btn { background: #228b22; color: #fff; border: none; border-radius: 5px; padding: 0.5em 1.5em; font-size: 1em; cursor: pointer; margin-bottom: 1em; }
    .export-btn:hover { background: #176b16; }
  </style>
</head>
<body>
  <h1>ServisKol – Strategický dashboard</h1>
  <button class="export-btn" onclick="window.print()">Exportovat do PDF</button>
  <div class="metrics">
    <div class="metric">
      <h2>AI & Automatizace</h2>
      <p>Uzavřené Issues (30 dní): <b>${impact.closed}</b></p>
      <p>Otevřené Issues: <b>${impact.open}</b></p>
    </div>
    <div class="metric">
      <h2>Plnění doporučení</h2>
      <p>Splněno: <b>${audit.done}</b></p>
      <p>Otevřeno: <b>${audit.open}</b></p>
      <p>Celkem: <b>${audit.total}</b></p>
    </div>
    <div class="metric">
      <h2>Zpětná vazba</h2>
      <p>Nová témata: <b>${voc.topics}</b></p>
      <p>Pozitivní: <b>${voc.positive}</b></p>
      <p>Negativní: <b>${voc.negative}</b></p>
    </div>
    <div class="metric">
      <h2>Marketing & Komunita</h2>
      <p>Otevřené body: <b>${marketing.open}</b></p>
      <p>Uzavřené body: <b>${marketing.closed}</b></p>
    </div>
  </div>
  <div class="chart">
    <h3>Trend plnění checklistů (časová osa)</h3>
    ${svgTrend || '<div style="color:#888">Není dostatek dat pro zobrazení trendu.</div>'}
  </div>
  <div class="chart">
    <h3>Aktuální stav checklistů</h3>
    <svg width="400" height="120">
      <rect x="20" y="20" width="360" height="80" fill="#e6fbe6" stroke="#228b22" stroke-width="2"/>
      <rect x="20" y="20" width="${audit.total ? 360 * audit.done / audit.total : 0}" height="80" fill="#228b22"/>
      <text x="200" y="70" font-size="24" fill="#228b22" text-anchor="middle">${audit.done}/${audit.total}</text>
    </svg>
  </div>
  <footer style="margin-top:3em;color:#888;font-size:0.9em;">Aktualizováno: ${new Date().toLocaleString('cs-CZ')}</footer>
</body>
</html>`;
}

function main() {
  const impact = parseImpactReport();
  const audit = parseAuditTrendReport();
  const trendHistory = parseAuditTrendHistory();
  const voc = parseVoiceOfCustomer();
  const marketing = parseMarketingCommunity();
  const html = renderDashboard(impact, audit, trendHistory, voc, marketing);
  fs.writeFileSync(DASHBOARD_FILE, html, 'utf8');
  console.log('Strategický dashboard vygenerován:', DASHBOARD_FILE);
}

main();
