// backend/scripts/ai_onboarding_checklist.js
// Generuje personalizovaný onboarding checklist na základě role, AI doporučení a lessons learned

const fs = require('fs');
const path = require('path');
const { getLessonsLearned, getRoleRecommendations } = require('../utils/onboardingUtils');

async function generateChecklist(user) {
  // Získání lessons learned a doporučení pro roli
  const lessons = await getLessonsLearned();
  const roleRecs = await getRoleRecommendations(user.role);

  // Základní checklist
  let checklist = [
    { task: 'Seznámení s projektem ServisKol', done: false },
    { task: 'Přečíst ONBOARDING_DEV.md', done: false },
    { task: 'Přečíst ONBOARDING_AI.md', done: false },
    { task: 'Přístup do repozitáře a dashboardu', done: false },
    { task: 'Nastavit vývojové prostředí', done: false },
  ];

  // Přidání lessons learned jako onboarding tipy
  lessons.forEach(l => {
    checklist.push({ task: `Tip: ${l}`, done: false });
  });

  // Přidání AI doporučení pro roli
  roleRecs.forEach(r => {
    checklist.push({ task: `Doporučení pro roli: ${r}`, done: false });
  });

  return checklist;
}

// Export pro použití v endpointu
module.exports = { generateChecklist };
