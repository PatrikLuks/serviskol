// backend/scripts/ai_onboarding_mentoring.js
// AI-driven onboarding mentoring: přiřazení mentora, doporučení, sledování pokroku

const mentors = [
  { name: 'Jana Nováková', role: 'developer', experience: 5 },
  { name: 'Petr Svoboda', role: 'analyst', experience: 7 },
  { name: 'Eva Dvořáková', role: 'devops', experience: 6 },
];

function assignMentor(user) {
  // Najdi mentora podle role
  const mentor = mentors.find(m => m.role === user.role) || mentors[0];
  // Generuj doporučení pro mentoring
  const recommendations = [
    `Pravidelně se setkávejte s mentorem (${mentor.name}) v prvních 2 týdnech.`,
    'Sdílejte otázky a překážky v onboarding dashboardu.',
    'Zaměřte se na lessons learned a best practices pro vaši roli.',
    'Mentor doporučuje: zapojit se do týmových meetingů a retrospektiv.',
  ];
  // Simulace pokroku (náhodně)
  const progress = recommendations.map((r, idx) => ({ recommendation: r, done: idx % 2 === 0 }));
  return {
    mentor: mentor.name,
    mentorRole: mentor.role,
    recommendations: progress,
  };
}

module.exports = { assignMentor };
