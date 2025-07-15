// backend/scripts/ai_onboarding_improvement_roadmap.js
// AI-driven onboarding continuous improvement: roadmapa inovací, pokrok

const { analyzeTrends } = require('./ai_onboarding_trends');
const { analyzeImpact } = require('./ai_onboarding_impact');

function generateRoadmap() {
  const trends = analyzeTrends();
  const impact = analyzeImpact();
  let roadmap = [];

  // Dynamické návrhy podle dat
  if (trends.problemCount > 2) {
    roadmap.push({
      title: 'Řešení opakovaných onboarding problémů',
      description: 'Zorganizujte workshop, aktualizujte lessons learned, zapojte mentoring.',
      done: false,
    });
  }
  if (impact.productivityScore < 60) {
    roadmap.push({
      title: 'Zvýšení produktivity nových členů',
      description: 'Zlepšete dokumentaci, onboarding workflow a best practices.',
      done: false,
    });
  }
  if (impact.satisfactionScore < 60) {
    roadmap.push({
      title: 'Zvýšení spokojenosti s onboardingem',
      description: 'Pravidelné check-iny, sběr zpětné vazby, mentoring.',
      done: false,
    });
  }
  // Vždy navrhni pravidelnou retrospektivu a export reportů
  roadmap.push({
    title: 'Pravidelná onboarding retrospektiva',
    description: 'AI generuje shrnutí, slabiny a akční kroky každé 2 týdny.',
    done: true,
  });
  roadmap.push({
    title: 'Automatizovaný export a archivace reportů',
    description: 'Reporty se automaticky archivují a rozesílají managementu.',
    done: true,
  });

  return roadmap;
}

module.exports = { generateRoadmap };
