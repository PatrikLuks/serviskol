// backend/scripts/ai_onboarding_knowledge_base.js
// AI-driven onboarding knowledge base: lessons learned, best practices, incidenty, inovace

const { analyzeTrends } = require('./ai_onboarding_trends');
const { generateBestPractices } = require('./ai_onboarding_best_practices');
const { detectIncidents } = require('./ai_onboarding_incident_management');
const { generateRoadmap } = require('./ai_onboarding_improvement_roadmap');

function generateKnowledgeBase() {
  const trends = analyzeTrends();
  const bestPractices = generateBestPractices();
  const incidents = detectIncidents();
  const roadmap = generateRoadmap();

  return {
    lessonsLearned: trends.lessons,
    bestPractices,
    incidents: incidents.incidents,
    incidentRecommendations: incidents.recommendations,
    improvementRoadmap: roadmap,
  };
}

module.exports = { generateKnowledgeBase };
