// backend/scripts/ai_sentiment_feedback_analysis.js
// AI-driven sentiment analýza uživatelské zpětné vazby a incidentů pro UX/produktové doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_sentiment_feedback_analysis-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  try {
    const files = fs.readdirSync(REPORTS_DIR)
      .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
      .sort();
    if (!files.length) return '';
    return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
  } catch (err) {
    console.error('Chyba při čtení reportu:', err);
    return '';
  }
}

async function generateSentimentAnalysis(feedback, incidents) {
  const prompt = `Jsi AI sentiment analytik. Na základě těchto dat:

Analyzuj sentiment, trendy, opakující se problémy a návrhy. Vygeneruj konkrétní doporučení pro UX, onboarding a produktové zlepšení. Stručně, v bodech.`;
  if (!feedback && !incidents) {
    return 'Není dostatek dat pro sentiment analýzu.';
  }
  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1200
    });
    return res.choices[0].message.content;
  } catch (err) {
    console.error('AI report generation failed:', err);
    return 'Nepodařilo se vygenerovat AI Sentiment Feedback Analysis Report. Zkontrolujte konfiguraci OpenAI API a vstupní data.';
  }
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
