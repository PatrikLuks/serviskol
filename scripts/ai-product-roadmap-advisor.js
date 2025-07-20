// scripts/ai-product-roadmap-advisor.js
// AI product roadmap advisor bot
// Usage: node scripts/ai-product-roadmap-advisor.js

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
  const aiReports = [
    'ai-usage-report.md',
    'ai-healthcheck-report.md',
    'ai-alert-report.md',
    'ai-prompt-test-report.md',
    'ai-impact-report.md',
    'ai-retrospective.md',
    'ai-test-coverage-review.md',
    'ai-onboarding-feedback.md',
    'ai-ux-feedback.md',
    'ai-security-trend-report.md',
    'ai-performance-trend-report.md',
    'ai-incident-postmortem.md'
  ].map(readIfExists).join('\n');
  const feedback = readIfExists('onboarding/feedback.log');
  const roadmap = readIfExists('ROADMAP.md');
  const prompt = `Jsi AI product roadmap advisor. Na základě těchto AI reportů, feedbacků, onboardingů, incidentů, usage a trendů navrhni prioritizovanou roadmapu: nové funkce, optimalizace, UX, bezpečnost, AI, růst. Piš česky, strukturovaně, s důrazem na strategii a dopad.\n\nAI reporty:\n${aiReports}\n\nFeedback:\n${feedback}\n\nStávající roadmapa:\n${roadmap}`;
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na produktový management a strategii.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-product-roadmap.md', output);
  console.log('AI product roadmap vygenerována: ai-product-roadmap.md');
})();
