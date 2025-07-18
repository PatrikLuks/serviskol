function checkPermission(user, permission) {
  if (!user || !user.permissions || !user.permissions.includes(permission)) {
    throw new Error('Nedostatečná oprávnění');
  }
}

async function generateChangeImpactReport(user) {
  checkPermission(user, 'governance:changeimpact');
  const changeimpact = require('../scripts/ai_change_impact_simulation');
  await changeimpact.main();
  return 'AI Change Impact Simulation Report byl vygenerován.';
}

async function generateProcessWeaknessReport(user) {
  checkPermission(user, 'governance:weakness');
  const weakness = require('../scripts/ai_predict_process_weaknesses');
  await weakness.main();
  return 'AI Process Weakness Prediction Report byl vygenerován.';
}

async function generateSentimentFeedbackReport(user) {
  checkPermission(user, 'governance:sentiment');
  const sentiment = require('../scripts/ai_sentiment_feedback_analysis');
  await sentiment.main();
  return 'AI Sentiment Feedback Analysis Report byl vygenerován.';
}

async function generateInnovationAdoptionReport(user) {
  checkPermission(user, 'governance:adoption');
  const adoption = require('../scripts/ai_innovation_adoption_trends');
  await adoption.main();
  return 'AI Innovation Adoption Trends Report byl vygenerován.';
}

module.exports = {
  generateChangeImpactReport,
  generateProcessWeaknessReport,
  generateSentimentFeedbackReport,
  generateInnovationAdoptionReport
};
