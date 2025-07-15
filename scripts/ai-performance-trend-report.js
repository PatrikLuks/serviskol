// scripts/ai-performance-trend-report.js
// AI performance trend report bot
// Usage: node scripts/ai-performance-trend-report.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

(async () => {
  const prometheus = readIfExists('monitoring/prometheus_alerts.yml');
  const health = readIfExists('ai-healthcheck-report.md');
  const audit = readIfExists('backend/logs/audit.log');
  const backendLog = readIfExists('backend/logs/feedback.log');
  const frontendLog = readIfExists('frontend/feedback.log');

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI performance trend report bot. Na základě těchto logů a reportů vygeneruj trend report: výkon backendu, frontendu, API, doporučení na optimalizace, detekce regresí. Piš česky, strukturovaně, s důrazem na praktické kroky.\n\nPrometheus alerts:\n${prometheus}\n\nAI Healthcheck:\n${health}\n\nAudit log:\n${audit}\n\nBackend feedback log:\n${backendLog}\n\nFrontend feedback log:\n${frontendLog}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na monitoring a optimalizaci výkonu.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-performance-trend-report.md', output);
  console.log('AI performance trend report vygenerován: ai-performance-trend-report.md');
})();
