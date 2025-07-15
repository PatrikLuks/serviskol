// backend/scripts/ai_onboarding_trends.js
// AI analýza trendů onboarding feedbacku a checklistů

const fs = require('fs');
const path = require('path');

function analyzeTrends() {
  // Načtení feedbacků
  const feedbackPath = path.join(__dirname, '../logs/onboarding_feedback.log');
  let feedbacks = [];
  if (fs.existsSync(feedbackPath)) {
    feedbacks = fs.readFileSync(feedbackPath, 'utf-8').split('\n').filter(Boolean);
  }

  // Načtení lessons learned
  const lessonsPath = path.join(__dirname, '../logs/onboarding_lessons_learned.log');
  let lessons = [];
  if (fs.existsSync(lessonsPath)) {
    lessons = fs.readFileSync(lessonsPath, 'utf-8').split('\n').filter(Boolean);
  }

  // AI analýza trendů (simulace)
  const problemCount = feedbacks.filter(f => f.toLowerCase().includes('problém')).length;
  const totalFeedback = feedbacks.length;
  const lessonCount = lessons.length;

  let recommendations = [];
  if (problemCount > 0) {
    recommendations.push('Zvýšit podporu pro nové členy v prvním týdnu.');
    recommendations.push('Zlepšit dokumentaci onboarding procesu.');
  }
  if (lessonCount > 5) {
    recommendations.push('Pravidelně aktualizovat lessons learned v dashboardu.');
  }

  return {
    totalFeedback,
    problemCount,
    lessonCount,
    recommendations,
    feedbacks,
    lessons,
  };
}

module.exports = { analyzeTrends };
