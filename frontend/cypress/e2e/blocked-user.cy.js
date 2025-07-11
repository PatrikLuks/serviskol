describe('Blokovaný uživatel', () => {
  it('Nemá přístup do aplikace a je odhlášen', () => {
    // Simulace blokovaného uživatele v localStorage
    const validToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJpZCI6IjEyMyIsImV4cCI6MjI5OTk5OTk5OX0.' +
      'dummySignature'; // platný token
    window.localStorage.setItem('token', validToken);
    window.localStorage.setItem('user', JSON.stringify({ id: '123', name: 'Blokovaný', email: 'blocked@test.cz', role: 'blocked' }));
    cy.visit('http://localhost:5173/');
    // Očekáváme, že aplikace uživatele odhlásí a přesměruje na login nebo zobrazí hlášku
    cy.url().should('include', '/login');
    cy.contains('Přihlášení').should('exist');
    cy.contains('Váš účet byl zablokován').should('exist');
  });
});
