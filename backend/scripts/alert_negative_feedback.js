// Skript pro alerting na negativní hodnocení AI chatu
const mongoose = require('mongoose');
const AIMessage = require('../models/AIMessage');
const { alertAdmins } = require('../utils/notificationUtils');
require('dotenv').config({ path: __dirname + '/../.env' });

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  // Najdi poslední negativní hodnocení za posledních 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const negative = await AIMessage.find({ rating: { $lte: 2 }, timestamp: { $gte: since } });
  if (negative.length > 0) {
    const text = negative.map(msg => `Uživatel: ${msg.userId}\nDotaz: ${msg.message}\nOdpověď: ${msg.reply}\nHodnocení: ${msg.rating}\nZpětná vazba: ${msg.feedback || '-'}\n---`).join('\n');
    await alertAdmins({
      subject: 'Negativní hodnocení AI chatu',
      text: `Bylo zaznamenáno ${negative.length} negativních hodnocení AI chatu za posledních 24h.\n\n${text}`
    });
    console.log(`Odeslán alert adminům (${negative.length} negativních hodnocení).`);
  } else {
    console.log('Žádné nové negativní hodnocení.');
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
