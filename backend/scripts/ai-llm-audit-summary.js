// ai-llm-audit-summary.js
// Pokročilé shrnutí a doporučení z audit logu pomocí OpenAI

const AuditLog = require('../models/AuditLog');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function llmAuditSummary() {
  // Posledních 100 záznamů audit logu
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  const logText = logs.map(l => `• [${l.createdAt?.toISOString() || ''}] ${l.type} – ${l.action || ''} (${l.user?.email || ''})`).join('\n');

  const prompt = `Jsi AI auditor. Na základě následujících záznamů audit logu:
${logText}

1. Stručně shrň hlavní trendy a události.
2. Detekuj podezřelé nebo opakující se vzorce.
3. Navrhni konkrétní doporučení pro zlepšení governance a bezpečnosti.
Odpověz česky, strukturovaně v bodech.`;

  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'system', content: 'Jsi AI auditor.' }, { role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.2
  });
  const summary = completion.data.choices[0].message.content;
  return {
    generatedAt: new Date(),
    summary,
    logSample: logText
  };
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    const result = await llmAuditSummary();
    console.log(result.summary);
    process.exit(0);
  });
}

module.exports = llmAuditSummary;
