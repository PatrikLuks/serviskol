describe('Registrace a přihlášení', () => {
  it('Uživatel se může zaregistrovat a přihlásit', () => {
    cy.visit('/register');
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

  it('Přihlášení selže při špatném hesle', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('pluks120@gmail.com');
    cy.get('input[name="password"]').type('spatneheslo');
    cy.get('button[type="submit"]').click();
    cy.contains('Chyba přihlášení').should('exist');
  });

  it('Přihlášení selže při neexistujícím emailu', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('neexistuje' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.contains('Chyba přihlášení').should('exist');
  });

  it('Přihlášení selže při prázdných polích', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains('Vyplňte všechna pole.').should('exist');
  });
});
