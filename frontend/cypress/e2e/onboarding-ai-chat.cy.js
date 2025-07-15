describe('Onboarding a AI chat (end-to-end)', () => {
  it('Nový uživatel projde onboardingem a použije AI chat', () => {
    // Registrace nového uživatele
    cy.visit('/register');
    cy.get('input[name="name"]').type('Onboard Test');
    cy.get('input[name="email"]').type('onboard' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.get('input[name="email"]').type('onboard' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');

    // Onboarding flow
    cy.contains('Začít onboarding').click();
    cy.contains('Servisní kniha').should('exist');
    cy.contains('Pokračovat').click();
    cy.contains('Věrnostní program').should('exist');
    cy.contains('Dokončit onboarding').click();
    cy.contains('Onboarding dokončen').should('exist');

    // AI chat
    cy.visit('/ai-chat');
    cy.get('textarea').type('Jak často mám servisovat kolo?');
    cy.get('button').contains('Odeslat').click();
    cy.contains(/servisovat|interval/i, { timeout: 10000 }).should('exist');
  });
});
