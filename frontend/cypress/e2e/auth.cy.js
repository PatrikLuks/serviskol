describe('Registrace a přihlášení', () => {
  it('Uživatel se může zaregistrovat a přihlásit', () => {
    cy.visit('http://localhost:5173/register');
    cy.get('input[name="name"]').type('Testovací Uživatel');
    cy.get('input[name="email"]').type('test' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
    cy.get('input[name="email"]').type('test' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.contains('Domovská stránka');
  });
});
