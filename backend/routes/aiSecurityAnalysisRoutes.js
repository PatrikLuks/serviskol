const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const User = require('../models/User');
const { Configuration, OpenAIApi } = require('openai');

// GET /api/admin/ai-security-analysis
router.get('/ai-security-analysis', async (req, res) => {
  try {
    const audit = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const alerts = await SecurityAlert.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const users = await User.find({}).lean();

    // Sestavíme prompt pro AI
    const prompt = `Analyzuj následující bezpečnostní logy, alerty a seznam adminů. Identifikuj podezřelé vzory, potenciální rizika a navrhni konkrétní opatření. Výstup strukturovaně: \n\n` +
      `Audit logy:\n${JSON.stringify(audit, null, 2)}\n\n` +
      `Alerty:\n${JSON.stringify(alerts, null, 2)}\n\n` +
      `Admini:\n${JSON.stringify(users.filter(u => u.role==='admin'), null, 2)}\n\n` +
      `Odpověz česky, strukturovaně: \n- Rizika\n- Doporučené zásahy\n- Pravděpodobnost incidentu (nízká/střední/vysoká)\n`;

    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Jsi bezpečnostní analytik a expert na governance.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 600
    });
    const result = completion.data.choices[0].message.content;
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: 'Chyba AI analýzy', detail: e.message });
  }
});

module.exports = router;
