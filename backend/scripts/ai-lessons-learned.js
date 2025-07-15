// ai-lessons-learned.js
// Generuje lessons learned/retrospektivu z audit logu a incidentů

const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');

async function generateLessonsLearned({ from, to } = {}) {
  const filter = {};
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  const incidents = await SecurityAlert.find(filter).lean();
  const auditEvents = await AuditLog.find(filter).lean();

  // Klíčové události
  const keyIncidents = incidents.slice(-5).map(i => `- [${i.createdAt?.toISOString().slice(0,10)}] ${i.type}: ${i.message}`);
  const keyChanges = auditEvents.filter(e => e.type && e.type.includes('change')).slice(-5).map(e => `- [${e.createdAt?.toISOString().slice(0,10)}] ${e.type}: ${e.action}`);

  // Lessons learned (heuristika)
  const lessons = [];
  if (incidents.length > 5) lessons.push('Zvýšený počet incidentů – doporučujeme detailní analýzu příčin a preventivní opatření.');
  if (auditEvents.filter(e => e.type && e.type.includes('unauthorized')).length > 3) lessons.push('Opakované pokusy o neoprávněný přístup – doporučujeme auditovat přístupová práva.');
  if (keyChanges.length > 3) lessons.push('Časté změny práv – doporučujeme zpřísnit schvalování a monitoring.');
  if (lessons.length === 0) lessons.push('Žádné zásadní incidenty nebo trendy nebyly detekovány.');

  const md = [];
  md.push(`# AI Lessons Learned & Retrospektiva`);
  md.push(`*Období: ${from || 'začátek'} – ${to || 'dnes'}*\n`);
  md.push(`## Klíčové incidenty`);
  md.push(keyIncidents.length ? keyIncidents.join('\n') : '- Žádné incidenty');
  md.push(`\n## Klíčové změny/práva`);
  md.push(keyChanges.length ? keyChanges.join('\n') : '- Žádné změny');
  md.push(`\n## Lessons learned & doporučení`);
  md.push(lessons.map(l => `- ${l}`).join('\n'));
  md.push(`\n---\n*Report generován AI governance systémem.*`);
  return md.join('\n');
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const md = await generateLessonsLearned({});
    console.log(md);
    process.exit(0);
  });
}

module.exports = generateLessonsLearned;
