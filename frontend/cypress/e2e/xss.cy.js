describe('Ochrana proti XSS', () => {
  it('Nezobrazí škodlivý kód z uživatelského vstupu', () => {
    // Simulace zadání XSS do formuláře (např. feedback, chat, jméno)
    const xssPayload = '<img src=x onerror=alert("XSS") />';
    cy.visit('/register');
    cy.get('input[name="name"]').type(xssPayload);
    cy.get('input[name="email"]').type('xss' + Date.now() + '@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    // Po registraci a přihlášení by se payload neměl vykreslit jako HTML ani spustit alert
    cy.visit('/profile');
    cy.contains(xssPayload, { matchCase: false }); // payload je zobrazen jako text, ne jako HTML
    // Ověření, že alert nebyl spuštěn (Cypress by test ukončil při alertu)
  });
});
