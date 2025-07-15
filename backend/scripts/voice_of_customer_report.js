// Automatizovaný report "Voice of Customer" (zpětná vazba, trendy, doporučení)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `voice_of_customer-${new Date().toISOString().slice(0,10)}.md`);

// Modely pro support ticket a AI chat (předpoklad)
let SupportTicket, AIMessage;
try {
  SupportTicket = require('../models/SupportTicket');
} catch {}
try {
  AIMessage = require('../models/AIMessage');
} catch {}

async function fetchSupportFeedback() {
  if (!SupportTicket) return [];
  return await SupportTicket.find({ feedback: { $exists: true, $ne: '' } }).lean();
}

async function fetchAIChatFeedback() {
  if (!AIMessage) return [];
  return await AIMessage.find({ feedback: { $exists: true, $ne: '' } }).lean();
}

function analyzeFeedback(feedbacks) {
  const topics = {};
  const positive = [], negative = [], neutral = [];
  feedbacks.forEach(fb => {
    const text = (fb.feedback || '').toLowerCase();
    if (text.match(/super|díky|skvělé|rychlé|spokojen/)) positive.push(text);
    else if (text.match(/špatn|nefunguje|pomal|nespokojen|chyba|problém/)) negative.push(text);
    else neutral.push(text);
    text.split(/\W+/).forEach(word => {
      if (word.length > 3) topics[word] = (topics[word]||0)+1;
    });
  });
  return { topics, positive, negative, neutral };
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Chyba: Není nastavena proměnná prostředí MONGODB_URI. Nastavte ji před spuštěním skriptu.');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const support = await fetchSupportFeedback();
  const ai = await fetchAIChatFeedback();
  const all = [...support, ...ai];
  const analysis = analyzeFeedback(all);
  let md = `# Voice of Customer (Zpětná vazba uživatelů)\n\n`;
  md += `- Počet zpětných vazeb: ${all.length}\n`;
  md += `- Pozitivní: ${analysis.positive.length}\n`;
  md += `- Negativní: ${analysis.negative.length}\n`;
  md += `- Neutrální: ${analysis.neutral.length}\n`;
  md += `\n## Nejčastější témata\n`;
  md += Object.entries(analysis.topics).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`- ${k} (${v})`).join('\n')+'\n';
  md += `\n## Ukázky pozitivní zpětné vazby\n`;
  md += analysis.positive.slice(0,5).map(t=>`- ${t}`).join('\n')+'\n';
  md += `\n## Ukázky negativní zpětné vazby\n`;
  md += analysis.negative.slice(0,5).map(t=>`- ${t}`).join('\n')+'\n';
  md += `\n---\nPro detailní analýzu viz MongoDB kolekce SupportTicket a AIMessage.\n`;
  fs.writeFileSync(OUT_PATH, md);
  console.log(`Voice of Customer report uložen do ${OUT_PATH}`);
  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
