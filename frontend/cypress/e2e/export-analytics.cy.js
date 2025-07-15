describe('Exporty a analytika (end-to-end)', () => {
  it('Admin stáhne export dat a zobrazí analytiku', () => {
    // Přihlášení jako admin
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@test.cz');
    cy.get('input[name="password"]').type('Admin1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');

    // Export dat
    cy.visit('/admin/export');
    cy.contains('Exportovat CSV').click();
    cy.readFile('cypress/downloads/export.csv').should('exist');

    // Analytika
    cy.visit('/admin/analytics');
    cy.contains('Dashboard analytiky').should('exist');
    cy.contains('Počet registrací').should('exist');
    cy.contains('Top akce').should('exist');
  });
});
