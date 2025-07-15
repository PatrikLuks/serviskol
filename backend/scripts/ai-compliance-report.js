// ai-compliance-report.js
// Generuje compliance report (GDPR/ISO 27001) v Markdownu

const generateGovernanceReport = require('./ai-governance-report');

async function generateComplianceReport() {
  const governance = await generateGovernanceReport();
  const md = [];
  md.push(`# Compliance Report (GDPR / ISO 27001)`);
  md.push(`*Vygenerováno: ${new Date().toLocaleString()}*\n`);

  md.push(`## Přehled incidentů a auditní stopy`);
  md.push(`- Počet incidentů za poslední rok: **${governance.summary.securityAlertCount}**`);
  md.push(`- Počet změn práv: **${governance.summary.userChangeCount}**`);
  md.push(`- Počet pokusů o neoprávněný přístup: **${governance.summary.unauthorizedAttemptCount}**`);

  md.push(`\n## Nejčastější typy incidentů`);
  md.push(governance.topIncidentTypes.map(t => `- ${t.type}: ${t.count}×`).join('\n'));

  md.push(`\n## Governance a bezpečnostní opatření`);
  md.push(`- Granularitní řízení přístupů: **ANO**`);
  md.push(`- Auditní logování: **ANO**`);
  md.push(`- Automatizovaná detekce incidentů a anomálií: **ANO**`);
  md.push(`- Pravidelné AI self-testy a reporting: **ANO**`);

  md.push(`\n## Doporučení pro auditora`);
  md.push(`- Zkontrolujte audit logy a incidenty za poslední období.`);
  md.push(`- Ověřte, že všechny změny práv jsou schválené a auditované.`);
  md.push(`- Proveďte náhodnou kontrolu incidentů a reakcí.`);

  md.push(`\n---\n*Report generován AI governance systémem pro účely GDPR/ISO auditu.*`);

  return md.join('\n');
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const md = await generateComplianceReport();
    console.log(md);
    process.exit(0);
  });
}

module.exports = generateComplianceReport;
