// scripts/ai-healthcheck.js
// AI-powered healthcheck & anomaly detection for backend API
// Usage: node scripts/ai-healthcheck.js

const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.HEALTHCHECK_BASE_URL || 'http://localhost:3001';
const ENDPOINTS = [
  '/api/health/health',
  '/api/users/me',
  '/api/alerts',
  // Přidej další klíčové endpointy dle potřeby
];

async function checkEndpoint(url) {
  try {
    const res = await axios.get(url, { timeout: 5000 });
    return { url, status: res.status, data: res.data };
  } catch (e) {
    return { url, error: e.message };
  }
}

async function aiAnalyze(results) {
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Analyze the following API healthcheck results. Detect anomalies, edge-case failures, or suspicious responses. Suggest possible causes and improvements.\n\n${JSON.stringify(results, null, 2)}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert API healthcheck and anomaly detection assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });
  return completion.data.choices[0].message.content;
}

(async () => {
  const results = [];
  for (const ep of ENDPOINTS) {
    results.push(await checkEndpoint(BASE_URL + ep));
  }
  const analysis = await aiAnalyze(results);
  const report = `# AI Healthcheck Report\n\n${new Date().toISOString()}\n\n## Results\n\n${JSON.stringify(results, null, 2)}\n\n## AI Analysis\n\n${analysis}\n`;
  fs.writeFileSync('ai-healthcheck-report.md', report);
  console.log(report);
})();
