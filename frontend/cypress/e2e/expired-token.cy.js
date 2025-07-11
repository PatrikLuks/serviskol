describe('Expirovaný JWT token', () => {
  it('Odhlásí uživatele při expirovaném tokenu', () => {
    // Vložíme expirovaný token do localStorage
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJpZCI6IjEyMyIsImV4cCI6MTYwOTAwMDAwMH0.' +
      'dummySignature'; // exp: 2020-12-26
    window.localStorage.setItem('token', expiredToken);
    window.localStorage.setItem('user', JSON.stringify({ id: '123', name: 'Test', email: 'test@test.cz', role: 'client' }));
    cy.visit('http://localhost:5173/');
    // Očekáváme, že aplikace uživatele odhlásí a přesměruje na login nebo zobrazí hlášku
    cy.url().should('include', '/login');
    cy.contains('Přihlášení').should('exist');
  });
});
