// Skript pro analýzu trendů v AI chatu a podpoře a automatizovanou notifikaci uživatelům
const mongoose = require('mongoose');
const AIMessage = require('../models/AIMessage');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const faqs = require('../utils/faq');
require('dotenv').config({ path: __dirname + '/../.env' });

function getMonthAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
}

function extractKeywords(text) {
  if (!text) return [];
  return text.toLowerCase().match(/\b\w{4,}\b/g) || [];
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const since = getMonthAgo();
  const messages = await AIMessage.find({ timestamp: { $gte: since } });

  // Analýza klíčových slov v dotazech a zpětné vazbě
  const keywords = {};
  messages.forEach(m => {
    extractKeywords(m.message).forEach(k => { keywords[k] = (keywords[k] || 0) + 1; });
    extractKeywords(m.feedback).forEach(k => { keywords[k] = (keywords[k] || 0) + 1; });
  });
  const topKeywords = Object.entries(keywords).sort((a, b) => b[1] - a[1]);

  // Analýza ticketů podpory z audit logu
  const fs = require('fs');
  const logPath = '/tmp/audit.log';
  let supportTopics = {};
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
    const sinceISO = since.toISOString();
    const tickets = lines.map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean)
      .filter(l => l.action === 'Podpora - nový ticket' && l.timestamp >= sinceISO);
    tickets.forEach(t => {
      extractKeywords(t.details.message).forEach(k => { supportTopics[k] = (supportTopics[k] || 0) + 1; });
    });
  }
  const topSupport = Object.entries(supportTopics).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Doporučení pro tým podpory
  let recommendations = [];
  if (topKeywords.length > 0) {
    recommendations.push('Zvažte rozšíření FAQ nebo návodů na témata: ' + topKeywords.map(([k]) => k).join(', '));
  }
  if (topSupport.length > 0) {
    recommendations.push('Zaměřte se na rychlejší řešení problémů v oblastech: ' + topSupport.map(([k]) => k).join(', '));
  }
  if (topKeywords.length > 0 && topSupport.length > 0 && topKeywords[0][0] === topSupport[0][0]) {
    recommendations.push('Pozor: Nejčastější problém v AI i podpoře je ' + topKeywords[0][0] + ' – doporučujeme proaktivní komunikaci.');
  }

  console.log('--- AI chat & podpora: trendy za poslední měsíc ---');
  console.log('Top témata v AI dotazech a zpětné vazbě:', topKeywords.slice(0, 10));
  console.log('Top témata v ticketech podpory:', topSupport);
  console.log('Doporučení:', recommendations);

  // Automatizovaná notifikace uživatelům při nárůstu dotazů na určité téma
  if (topKeywords.length > 0 && topKeywords[0][1] > 5 && (topKeywords.length === 1 || topKeywords[0][1] > 2 * topKeywords[1][1])) {
    const hotKeyword = topKeywords[0][0];
    // Najdi odpovídající FAQ
    const faq = faqs.find(f => f.keywords.includes(hotKeyword));
    if (faq) {
      // Najdi uživatele, kteří se na téma ptali
      const userIds = [...new Set(messages.filter(m => extractKeywords(m.message).includes(hotKeyword)).map(m => m.userId.toString()))];
      const users = await User.find({ _id: { $in: userIds } });
      for (const user of users) {
        await createNotification({
          user: user._id,
          type: 'info',
          message: `Nový návod: ${faq.question} – ${faq.link}`,
          channel: user.notificationChannel || 'in-app'
        });
      }
      // Audit log kampaně
      const { auditLog } = require('../middleware/auditLog');
      auditLog('Automatizovaná kampaň', null, {
        tema: hotKeyword,
        faq: faq.link,
        faqQuestion: faq.question,
        userCount: users.length,
        timestamp: new Date().toISOString()
      });
      console.log(`Notifikace odeslána ${users.length} uživatelům k tématu '${hotKeyword}'. Kampaň zapsána do audit logu.`);
    }
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
