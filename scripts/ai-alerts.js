// scripts/ai-alerts.js
// AI-powered log analysis, anomaly detection & predictive alerting
// Usage: node scripts/ai-alerts.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LOG_PATTERN = 'backend/logs/*.log';

function readLogs(pattern) {
  const files = glob.sync(pattern);
  let logs = '';
  for (const file of files) {
    try {
      logs += `\n--- ${file} ---\n` + fs.readFileSync(file, 'utf8');
    } catch (e) {
      logs += `\n--- ${file} ---\n[ERROR READING FILE: ${e.message}]`;
    }
  }
  return logs;
}

async function aiAnalyze(logs) {
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Analyze the following backend logs. Detect anomalies, error spikes, security issues, and predict possible incidents. Suggest improvements and highlight critical events.\n\n${logs.slice(-12000)}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert log analyst and incident predictor.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 700
  });
  return completion.data.choices[0].message.content;
}

(async () => {
  const logs = readLogs(LOG_PATTERN);
  if (!logs.trim()) {
    console.log('No logs found.');
    process.exit(0);
  }
  const analysis = await aiAnalyze(logs);
  const report = `# AI Alert Report\n\n${new Date().toISOString()}\n\n## Log Analysis\n\n${analysis}\n`;
  fs.writeFileSync('ai-alert-report.md', report);
  console.log(report);
})();
