describe('2FA povinné pro adminy/techniky', () => {
  it('Vyžaduje 2FA při přihlášení admina s aktivním 2FA', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin2fa@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    // Očekáváme, že se zobrazí pole pro 2FA kód
    cy.contains('2FA kód z aplikace').should('exist');
    cy.get('input[placeholder="2FA kód z aplikace"]').should('exist');
    cy.get('button[type="submit"]').contains('Ověřit a přihlásit').should('exist');
  });
});
