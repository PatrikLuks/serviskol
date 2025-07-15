function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function sendSlackNotification(stale) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook || !stale.length) return;
  const text = `:warning: *Dlouhodobě otevřených AI/retrospektivních Issues: ${stale.length}*\n` +
    stale.map(i => `<${i.html_url}|#${i.number} ${i.title}> (otevřeno před ${daysAgo(i.created_at)} dny)`).join('\n');
  const payload = JSON.stringify({ text });
  const url = new URL(webhook);
  const opts = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  const req = https.request(opts, res => {
    res.on('data', () => {});
    res.on('end', () => {});
  });
  req.on('error', e => { console.error('Slack webhook error:', e.message); });
  req.write(payload);
  req.end();
}
// Automatizovaný report stavu plnění AI/retrospektivních doporučení (GitHub Issues)
const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = 'PatrikLuks';
const REPO = 'serviskol';
const TOKEN = process.env.GITHUB_TOKEN;
const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_issues_status-${new Date().toISOString().slice(0,10)}.md`);

function fetchIssues(state = 'all', labels = ['ai-recommendation', 'retrospective']) {
  return new Promise((resolve, reject) => {
    const labelStr = labels.map(encodeURIComponent).join(',');
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/issues?state=${state}&labels=${labelStr}&per_page=100`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'serviskol-ai-bot',
        'Accept': 'application/vnd.github+json'
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(body));
        else reject(new Error(`GitHub API: ${res.statusCode} ${body}`));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function daysAgo(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000*60*60*24));
}

async function main() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN není nastaven');
  const issues = await fetchIssues('all');
  const open = issues.filter(i => i.state === 'open');
  const closed = issues.filter(i => i.state === 'closed');
  const stale = open.filter(i => daysAgo(i.created_at) > 30);
  if (stale.length >= 3) sendSlackNotification(stale);
  // Metriky řešení
  const closedDurations = closed
    .filter(i => i.closed_at && i.created_at)
    .map(i => daysAgo(i.created_at) - daysAgo(i.closed_at));
  const avgDuration = mean(closedDurations);
  const fastest = closedDurations.length ? closed.reduce((a,b)=>((daysAgo(a.created_at)-daysAgo(a.closed_at))<(daysAgo(b.created_at)-daysAgo(b.closed_at))?a:b)) : null;
  const slowest = closedDurations.length ? closed.reduce((a,b)=>((daysAgo(a.created_at)-daysAgo(a.closed_at))>(daysAgo(b.created_at)-daysAgo(b.closed_at))?a:b)) : null;

  let md = `# Stav plnění AI/retrospektivních doporučení\n\n`;
  md += `- Otevřených Issues: ${open.length}\n`;
  md += `- Uzavřených Issues: ${closed.length}\n`;
  md += `- Dlouhodobě otevřených (>30 dní): ${stale.length}\n`;
  if (closedDurations.length) {
    md += `- Průměrná doba řešení: ${avgDuration.toFixed(1)} dní\n`;
    if (fastest) md += `- Nejrychleji vyřešené: #${fastest.number} (${fastest.title}) za ${Math.abs(daysAgo(fastest.created_at)-daysAgo(fastest.closed_at))} dní\n`;
    if (slowest) md += `- Nejdéle řešené: #${slowest.number} (${slowest.title}) za ${Math.abs(daysAgo(slowest.created_at)-daysAgo(slowest.closed_at))} dní\n`;
  }
  if (stale.length) {
    md += `\n## Dlouhodobě neřešené Issues\n`;
    stale.forEach(i => {
      md += `- [#${i.number}](${i.html_url}) ${i.title} (otevřeno před ${daysAgo(i.created_at)} dny)\n`;
    });
  }
  if (closed.length) {
    md += `\n## Opatření zavedena (uzavřená Issues)\n`;
    closed.forEach(i => {
      const duration = Math.abs(daysAgo(i.created_at)-daysAgo(i.closed_at));
      md += `- [#${i.number}](${i.html_url}) ${i.title} – uzavřeno ${i.closed_at?.slice(0,10)} uživatelem ${i.closed_by?.login || 'N/A'} (řešeno ${duration} dní)\n`;
    });
  }
  md += `\n## Všechny otevřené Issues\n`;
  open.forEach(i => {
    md += `- [#${i.number}](${i.html_url}) ${i.title} (otevřeno před ${daysAgo(i.created_at)} dny)\n`;
  });
  md += `\n## Nedávno uzavřené Issues\n`;
  closed.slice(-5).forEach(i => {
    md += `- [#${i.number}](${i.html_url}) ${i.title} (uzavřeno před ${daysAgo(i.closed_at)} dny)\n`;
  });
  fs.writeFileSync(OUT_PATH, md);
  console.log(`Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
