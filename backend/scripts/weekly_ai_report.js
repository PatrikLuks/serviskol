// Skript pro týdenní report AI chatu
const mongoose = require('mongoose');
const AIMessage = require('../models/AIMessage');
const { alertAdmins } = require('../utils/notificationUtils');
require('dotenv').config({ path: __dirname + '/../.env' });

function getWeekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

function extractKeywords(text) {
  if (!text) return [];
  return text.toLowerCase().match(/\b\w{4,}\b/g) || [];
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const since = getWeekAgo();
  const messages = await AIMessage.find({ timestamp: { $gte: since } });
  const total = messages.length;
  const rated = messages.filter(m => typeof m.rating === 'number');
  const avgRating = rated.length ? (rated.reduce((a, b) => a + b.rating, 0) / rated.length).toFixed(2) : 'N/A';
  const negative = rated.filter(m => m.rating <= 2).length;
  const positive = rated.filter(m => m.rating >= 4).length;

  // Analýza klíčových slov
  const keywords = {};
  messages.forEach(m => {
    extractKeywords(m.message).forEach(k => { keywords[k] = (keywords[k] || 0) + 1; });
    extractKeywords(m.feedback).forEach(k => { keywords[k] = (keywords[k] || 0) + 1; });
  });
  const topKeywords = Object.entries(keywords).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Počet ticketů podpory založených po negativním hodnocení AI
  // (hledáme v audit logu akce 'Podpora - nový ticket' za posledních 7 dní)
  const fs = require('fs');
  const logPath = '/tmp/audit.log';

  // Výpočet průměrné doby řešení ticketů a průměrného hodnocení spokojenosti
  let avgResolution = 'N/A';
  let avgSatisfaction = 'N/A';
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    const sinceISO = since.toISOString();
    const parsed = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
    const tickets = parsed.filter(l => l.action === 'Podpora - nový ticket' && l.timestamp >= sinceISO);
    const closed = parsed.filter(l => l.action === 'Podpora - ticket uzavřen' && l.timestamp >= sinceISO);
    supportTickets = tickets.length;
    // Map ticketId -> otevření
    const ticketOpen = {};
    tickets.forEach(t => {
      const id = t.details.ticketId || t.details.aiMessageId || t.details.messageId || t.timestamp;
      ticketOpen[id] = t.timestamp;
    });
    // Najdi uzavřené ticketId, vypočítej dobu řešení a sbírej satisfaction
    let totalRes = 0, countRes = 0, totalSat = 0, countSat = 0;
    closed.forEach(c => {
      const id = c.details.ticketId || c.details.aiMessageId || c.details.messageId || c.timestamp;
      const opened = ticketOpen[id];
      if (opened) {
        const t1 = new Date(opened).getTime();
        const t2 = new Date(c.timestamp).getTime();
        if (!isNaN(t1) && !isNaN(t2) && t2 > t1) {
          totalRes += (t2 - t1) / 1000 / 60 / 60; // hodiny
          countRes++;
        }
      }
      if (typeof c.details.satisfaction === 'number') {
        totalSat += c.details.satisfaction;
        countSat++;
      }
    });
    if (countRes) avgResolution = (totalRes / countRes).toFixed(2) + ' h';
    if (countSat) avgSatisfaction = (totalSat / countSat).toFixed(2);
  }

  const text = `AI chat report za posledních 7 dní:\n\nPočet dotazů: ${total}\nPrůměrné hodnocení: ${avgRating}\nNegativní hodnocení (<=2): ${negative}\nPozitivní hodnocení (>=4): ${positive}\nPočet ticketů podpory po negativním hodnocení: ${supportTickets}\nPrůměrná doba řešení ticketu: ${avgResolution}\nPrůměrné hodnocení spokojenosti po uzavření: ${avgSatisfaction}\n\nTop témata/klíčová slova:\n${topKeywords.map(([k, v]) => `${k}: ${v}`).join('\\n')}`;

  await alertAdmins({
    subject: 'Týdenní report AI chatu',
    text
  });
  console.log('Týdenní report odeslán adminům.');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
