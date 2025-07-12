/// <reference types="cypress" />

describe('Základní uživatelský flow: registrace a přihlášení', () => {
  const testUser = {
    name: 'Testovací Uživatel',
    email: `testuser_${Date.now()}@example.com`,
    password: 'testheslo123',
    role: 'client',
  };

  it('Registrace nového uživatele', () => {
    cy.visit('/register');
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('select[name="role"]').select('client');
    cy.get('button[type="submit"]').click();
    cy.contains(/Registrace úspěšná/).should('exist');
  });

  it('Přihlášení nově registrovaným uživatelem', () => {
    cy.request('POST', '/api/users/login', {
      email: testUser.email,
      password: testUser.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      window.localStorage.setItem('token', response.body.token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    });
    cy.reload();
    cy.visit('/bikes');
    cy.contains('Moje kola').should('be.visible');
  });

  it('Ověření přístupu k chráněné stránce', () => {
    cy.request('POST', '/api/users/login', {
      email: testUser.email,
      password: testUser.password
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.window().then((win) => {
        win.localStorage.setItem('token', response.body.token);
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
      });
    });
    cy.visit('/bikes');
    cy.contains('Moje kola').should('be.visible');
  });
});
