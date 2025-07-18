// backend/scripts/ai_predict_process_weaknesses.js
// AI-driven predikce slabých míst v procesech na základě audit logů, incidentů a feedbacku
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_predict_process_weaknesses-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateWeaknessPrediction(auditLog, incidents, feedback) {
  const prompt = `Jsi AI process risk analyst. Na základě těchto dat:

Predikuj slabá místa v procesech, workflow nebo automatizacích. Uveď konkrétní rizika, doporučení a priority pro zlepšení. Stručně, v bodech.`;
  if (!auditLog && !incidents && !feedback) {
    return 'Není dostatek dat pro predikci slabých míst v procesech.';
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
    return 'Nepodařilo se vygenerovat AI Process Weakness Prediction Report. Zkontrolujte konfiguraci OpenAI API a vstupní data.';
  }
}

async function main() {
  const auditLog = getLatestReport('ai_audit_log-');
  const incidents = getLatestReport('incident_trend_report-');
  const feedback = getLatestReport('voice_of_customer-');
  const report = await generateWeaknessPrediction(auditLog, incidents, feedback);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Process Weakness Prediction Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
