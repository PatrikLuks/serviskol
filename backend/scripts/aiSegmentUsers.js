const User = require('../models/User');
const Segment = require('../models/Segment');
const mongoose = require('mongoose');
const axios = require('axios');

// Heuristická/AI segmentace uživatelů
async function aiSegmentUsers() {
  const users = await User.find({ role: 'client' }).lean();
  for (const u of users) {
    let aiSegment = 'ostatní';
    // Heuristika: vysoký engagement = VIP, nízký = riziko odchodu, střední = běžný
    if (u.engagementScore >= 80) aiSegment = 'VIP';
    else if (u.engagementScore <= 20) aiSegment = 'riziko_odchodu';
    else if (u.engagementScore >= 40) aiSegment = 'aktivní';
    // Příklad s OpenAI API (volitelné, pokud je klíč)
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Uživatel: ${u.email}, engagement: ${u.engagementScore}, region: ${u.region}, věk: ${u.age}. Do jakého segmentu bys ho zařadil? (VIP, riziko_odchodu, aktivní, ostatní)`;
        const ai = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 10
        }, {
          headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        const seg = ai.data.choices[0].message.content.trim().toLowerCase();
        if (['vip','riziko_odchodu','aktivní','ostatní'].includes(seg)) aiSegment = seg;
      } catch {}
    }
    await User.updateOne({ _id: u._id }, { aiSegment });
  }
  // Zajistit, že segmenty existují v Segment kolekci
  const allSegs = ['VIP','riziko_odchodu','aktivní','ostatní'];
  for (const s of allSegs) {
    await Segment.updateOne({ name: s }, { $setOnInsert: { name: s, description: 'AI segment' } }, { upsert: true });
  }
}

if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/serviskol', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => aiSegmentUsers())
    .then(() => { console.log('AI segmentace hotova'); process.exit(0); })
    .catch(e => { console.error(e); process.exit(1); });
}

module.exports = aiSegmentUsers;
