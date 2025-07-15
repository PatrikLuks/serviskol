// backend/scripts/ai_onboarding_predict_weaknesses.js
// AI predikce budoucích slabin onboarding procesu a návrh preventivních opatření

const { analyzeTrends } = require('./ai_onboarding_trends');

function predictWeaknesses() {
  const trends = analyzeTrends();
  let prediction = '';
  let recommendations = [];

  // Simulace predikce: pokud roste počet problémů, predikujeme riziko
  if (trends.problemCount > 2) {
    prediction = 'Riziko opakovaných onboarding problémů v příštím kvartálu.';
    recommendations.push('Zajistit mentoring pro nové členy.');
    recommendations.push('Zlepšit onboarding dokumentaci.');
    recommendations.push('Pravidelně aktualizovat lessons learned.');
  } else {
    prediction = 'Onboarding proces je stabilní, riziko slabin je nízké.';
    recommendations.push('Pokračovat v pravidelném sběru zpětné vazby.');
  }

  return {
    prediction,
    recommendations,
    currentProblems: trends.problemCount,
    feedbacks: trends.feedbacks,
  };
}

module.exports = { predictWeaknesses };
