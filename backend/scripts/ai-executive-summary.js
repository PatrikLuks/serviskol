// ai-executive-summary.js
// Generuje stručný executive summary report v Markdownu

const generateGovernanceReport = require('./ai-governance-report');
const predictIncidentRisk = require('./ai-incident-risk-predictor');

async function generateExecutiveSummary() {
  const governance = await generateGovernanceReport();
  const risk = await predictIncidentRisk();

  const md = [];
  md.push(`# AI Executive Summary Report`);
  md.push(`*Vygenerováno: ${new Date().toLocaleString()}*\n`);

  md.push(`## Governance stav`);
  md.push(`- Audit logů: **${governance.summary.auditEventCount}**`);
  md.push(`- Bezpečnostních alertů: **${governance.summary.securityAlertCount}**`);
  md.push(`- Změn práv: **${governance.summary.userChangeCount}**`);
  md.push(`- Pokusů o neoprávněný přístup: **${governance.summary.unauthorizedAttemptCount}**`);

  md.push(`\n## Trendy a anomálie`);
  md.push(`- Incidenty: ${governance.anomalySummary.securityAlertChange}% změna`);
  md.push(`- Pokusy o přístup: ${governance.anomalySummary.unauthorizedAttemptChange}% změna`);
  md.push(`- Nejčastější incidenty: ${governance.topIncidentTypes.map(t => `${t.type} (${t.count}×)`).join(', ')}`);

  md.push(`\n## Riziko a doporučení`);
  md.push(`- Odhadované riziko: **${risk.riskLevel}**`);
  md.push(`- Doporučení: ${risk.recommendations.join(' ')}`);

  md.push(`\n## Nejaktivnější uživatelé`);
  md.push(`- Pozitivně: ${governance.topUsers.map(u => `${u.email} (${u.count})`).join(', ')}`);
  md.push(`- Incidenty: ${governance.topIncidentUsers.map(u => `${u.email} (${u.count})`).join(', ')}`);

  md.push(`\n---\n*Report generován AI governance systémem.*`);

  return md.join('\n');
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const md = await generateExecutiveSummary();
    console.log(md);
    process.exit(0);
  });
}

module.exports = generateExecutiveSummary;
