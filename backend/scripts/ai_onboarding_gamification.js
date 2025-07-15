// backend/scripts/ai_onboarding_gamification.js
// AI-driven onboarding gamifikace: body, žebříček, motivace

const leaderboard = [
  { name: 'Jana Nováková', points: 120 },
  { name: 'Petr Svoboda', points: 110 },
  { name: 'Eva Dvořáková', points: 95 },
  { name: 'Nový člen', points: 80 },
];

function getGamificationStatus(user) {
  // Simulace: body podle splněných onboarding úkolů
  const userEntry = leaderboard.find(l => l.name === (user.name || 'Nový člen')) || leaderboard[3];
  // Doporučení pro zvýšení bodů
  const recommendations = [
    'Splňte všechny onboarding úkoly a doporučení.',
    'Zúčastněte se mentoringových setkání.',
    'Sdílejte lessons learned v dashboardu.',
    'Poskytněte zpětnou vazbu k onboarding procesu.',
  ];
  return {
    points: userEntry.points,
    leaderboard,
    recommendations,
  };
}

module.exports = { getGamificationStatus };
