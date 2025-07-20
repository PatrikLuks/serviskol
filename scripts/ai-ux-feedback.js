// scripts/ai-ux-feedback.js
// AI UX feedback bot
// Usage: node scripts/ai-ux-feedback.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (e) {
    console.error(e);
    return '';
  }
}

(async () => {
  const feedback = readIfExists('onboarding/feedback.log');
  const incident = readIfExists('backend/logs/incident.log');
  const aiReports = [
    'ai-onboarding-feedback.md',
    'ai-retrospective.md',
    'ai-incident-postmortem.md',
    'ai-healthcheck-report.md',
    'ai-alert-report.md'
  ].map(readIfExists).join('\n');

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI UX feedback bot. Na základě těchto feedbacků, incidentů a AI reportů vygeneruj UX shrnutí: co zlepšit, konkrétní návrhy, prioritizace, inspirace pro design. Piš česky, strukturovaně, s důrazem na praktické kroky.\n\nFeedback log:\n${feedback}\n\nIncident log:\n${incident}\n\nAI reporty:\n${aiReports}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na UX a produktový design.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-ux-feedback.md', output);
  console.log('AI UX feedback vygenerován: ai-ux-feedback.md');
})();
