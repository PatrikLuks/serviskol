// backend/scripts/ai_sentiment_feedback_analysis.js
// AI-driven sentiment analýza uživatelské zpětné vazby a incidentů pro UX/produktové doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_sentiment_feedback_analysis-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateSentimentAnalysis(feedback, incidents) {
  const prompt = `Jsi AI sentiment analytik. Na základě těchto dat:

--- USER FEEDBACK ---\n${feedback}\n
--- INCIDENTS ---\n${incidents}\n
Analyzuj sentiment, trendy, opakující se problémy a návrhy. Vygeneruj konkrétní doporučení pro UX, onboarding a produktové zlepšení. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const feedback = getLatestReport('voice_of_customer-');
  const incidents = getLatestReport('incident_trend_report-');
  const report = await generateSentimentAnalysis(feedback, incidents);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Sentiment Feedback Analysis Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
