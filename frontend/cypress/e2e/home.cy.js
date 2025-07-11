describe('Login stránka', () => {
  it('zobrazí titulek Přihlášení', () => {
    cy.visit('/login');
    cy.contains('Přihlášení');
  });
});
