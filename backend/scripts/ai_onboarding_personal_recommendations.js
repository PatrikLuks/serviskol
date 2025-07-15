// backend/scripts/ai_onboarding_personal_recommendations.js
// AI generování personalizovaných onboarding doporučení pro uživatele

const { getLessonsLearned, getRoleRecommendations } = require('../utils/onboardingUtils');

async function generatePersonalRecommendations(user) {
  const lessons = await getLessonsLearned();
  const roleRecs = await getRoleRecommendations(user.role);

  // Personalizovaná doporučení
  let recommendations = [
    `Vítejte v týmu! Doporučujeme začít s onboarding checklistem.`,
    `Role: ${user.role}`,
  ];
  roleRecs.forEach(r => recommendations.push(r));
  lessons.forEach(l => recommendations.push(`Tip: ${l}`));

  // Simulace sledování plnění (náhodně)
  const status = recommendations.map((r, idx) => ({ recommendation: r, done: idx % 2 === 0 }));

  return status;
}

module.exports = { generatePersonalRecommendations };
