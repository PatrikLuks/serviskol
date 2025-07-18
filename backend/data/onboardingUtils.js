// Data utility pro onboarding lessons learned a AI doporučení
async function getLessonsLearned() {
  return [
    'Nejčastější onboarding překážky: komunikujte v týmu otevřeně',
    'Využívejte AI dashboard pro rychlé dotazy',
    'Pravidelně sledujte incidenty a reporty',
  ];
}

async function getRoleRecommendations(role) {
  if (role === 'developer') {
    return [
      'Prostudujte architekturu backendu a frontend aplikace',
      'Zkontrolujte CI/CD pipeline',
      'Seznamte se s monitoringem a alerty',
    ];
  }
  if (role === 'analyst') {
    return [
      'Projděte reporting a analytické dashboardy',
      'Seznamte se s lessons learned a retrospektivami',
    ];
  }
  return ['Seznamte se s hlavními workflow projektu'];
}

module.exports = { getLessonsLearned, getRoleRecommendations };
