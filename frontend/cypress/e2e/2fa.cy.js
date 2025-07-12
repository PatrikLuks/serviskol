describe('2FA workflow', () => {
  it('Uživatel aktivuje a ověří 2FA', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test2fa@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.visit('/profile-settings');
    cy.contains('Aktivovat 2FA').click();
    cy.contains('Naskenujte QR kód');
    // Simulace zadání kódu by vyžadovala přístup k generovanému TOTP, zde pouze UI test
    cy.get('input[placeholder="Kód z aplikace"]').type('000000');
    cy.contains('Ověřit a aktivovat').click();
    cy.contains('2FA bylo úspěšně aktivováno!');
  });
});
