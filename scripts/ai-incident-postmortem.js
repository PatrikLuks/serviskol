// scripts/ai-incident-postmortem.js
// AI incident postmortem bot
// Usage: node scripts/ai-incident-postmortem.js

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
  const alert = readIfExists('ai-alert-report.md');
  const audit = readIfExists('backend/logs/audit.log');
  const health = readIfExists('ai-healthcheck-report.md');
  const incidentLog = readIfExists('backend/logs/incident.log');
  const feedback = readIfExists('onboarding/feedback.log');

  if (!alert && !audit && !health && !incidentLog) {
    console.log('No incident data found.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI incident postmortem bot. Na základě těchto dat vygeneruj postmortem: příčina, průběh, dopad, co zlepšit, akční kroky, prevence. Piš česky, strukturovaně, s důrazem na zlepšování týmu a prevence incidentů.\n\nAI Alert:\n${alert}\n\nAudit log:\n${audit}\n\nAI Healthcheck:\n${health}\n\nIncident log:\n${incidentLog}\n\nFeedback:\n${feedback}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na postmortem analýzy a prevenci incidentů.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-incident-postmortem.md', output);
  console.log('AI incident postmortem vygenerován: ai-incident-postmortem.md');
})();
