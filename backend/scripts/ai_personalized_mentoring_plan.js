// backend/scripts/ai_personalized_mentoring_plan.js
// AI-driven personalizované mentoringové plány pro členy týmu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_personalized_mentoring_plan-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function getTeamMembers() {
  // TODO: Načíst členy týmu z DB nebo statického souboru (mock)
  return [
    { name: 'Alice', role: 'Backend', skills: ['Node.js', 'MongoDB'], goals: ['security', 'automation'] },
    { name: 'Bob', role: 'Frontend', skills: ['React', 'Next.js'], goals: ['UX', 'testing'] },
    { name: 'Eve', role: 'DevOps', skills: ['Docker', 'CI/CD'], goals: ['resilience', 'monitoring'] }
  ];
}

async function generateMentoringPlan(members, knowledgeBase, lessons, bestPractices) {
  const prompt = `Jsi AI mentoring coach. Pro každého člena týmu navrhni personalizovaný mentoringový plán na základě jeho rolí, dovedností, cílů a těchto dat:

--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- BEST PRACTICES ---\n${bestPractices}\n
Tým:
${JSON.stringify(members, null, 2)}

Uveď konkrétní doporučení, micro-workshopy, mentoringové aktivity, cíle a metriky pro každého člena. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const members = getTeamMembers();
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const bestPractices = getLatestReport('ai_best_practices_report-');
  const report = await generateMentoringPlan(members, knowledgeBase, lessons, bestPractices);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Personalized Mentoring Plan uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => {
    console.error('Chyba v AI personalized mentoring plan:', e);
    process.exit(1);
  });
}

module.exports = { main };
