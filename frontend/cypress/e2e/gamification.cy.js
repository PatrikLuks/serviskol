describe('Gamifikace a žebříček', () => {
  it('Uživatel vidí žebříček a může získat odměnu', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('testgami@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.visit('/');
    cy.contains('Žebříček uživatelů');
    cy.contains('Odměny');
    cy.get('button').contains('Získat').first().click();
    cy.contains('Odměna přidělena!');
  });
});
