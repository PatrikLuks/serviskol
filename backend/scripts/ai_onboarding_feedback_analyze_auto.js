// Automatizovaná AI analýza onboarding feedbacku a doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_onboarding_feedback_analyze-latest.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chybí OPENAI_API_KEY v .env');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith(prefix));
  if (!files.length) return '';
  const latest = files.sort().reverse()[0];
  return fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf-8');
}

async function generateOnboardingFeedbackAnalysis(feedback, incidents, lessons) {
  const prompt = `Jsi AI onboarding analytik. Na základě těchto dat:
--- FEEDBACK ---\n${feedback}\n--- INCIDENTS ---\n${incidents}\n--- LESSONS LEARNED ---\n${lessons}\n
Analyzuj slabiny onboarding procesu, navrhni konkrétní doporučení a akční kroky pro zlepšení. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const feedback = getLatestReport('onboarding-feedback-');
  const incidents = getLatestReport('incident_trend_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  if (!feedback && !incidents && !lessons) {
    console.error('Chybí podklady pro onboarding feedback analýzu.');
    process.exit(1);
  }
  const report = await generateOnboardingFeedbackAnalysis(feedback, incidents, lessons);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Onboarding Feedback Analysis report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}
