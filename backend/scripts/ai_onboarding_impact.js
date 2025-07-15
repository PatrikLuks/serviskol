// backend/scripts/ai_onboarding_impact.js
// AI analýza dopadu onboarding zlepšení (rychlost, spokojenost, produktivita)

const fs = require('fs');
const path = require('path');

function analyzeImpact() {
  // Simulace dat: načtení feedbacků a lessons learned
  const feedbackPath = path.join(__dirname, '../logs/onboarding_feedback.log');
  let feedbacks = [];
  if (fs.existsSync(feedbackPath)) {
    feedbacks = fs.readFileSync(feedbackPath, 'utf-8').split('\n').filter(Boolean);
  }

  // Simulace: počítáme pozitivní/negativní feedbacky
  const positive = feedbacks.filter(f => f.toLowerCase().includes('dobrý') || f.toLowerCase().includes('rychlý')).length;
  const negative = feedbacks.filter(f => f.toLowerCase().includes('problém') || f.toLowerCase().includes('pomalý')).length;
  const total = feedbacks.length;

  // Simulace: produktivita = poměr pozitivních feedbacků
  const productivityScore = total > 0 ? Math.round((positive / total) * 100) : 0;
  // Simulace: spokojenost = poměr pozitivních k negativním
  const satisfactionScore = total > 0 ? Math.round((positive / (negative + 1)) * 100) : 0;
  // Simulace: rychlost = počet feedbacků s "rychlý" / total
  const speedScore = total > 0 ? Math.round((feedbacks.filter(f => f.toLowerCase().includes('rychlý')).length / total) * 100) : 0;

  return {
    productivityScore,
    satisfactionScore,
    speedScore,
    positive,
    negative,
    total,
    feedbacks,
  };
}

module.exports = { analyzeImpact };
