describe('Servisní workflow (end-to-end)', () => {
  it('Uživatel vytvoří servisní žádost, přidá fotku a změní stav', () => {
    // Přihlášení
    cy.visit('/login');
    cy.get('input[name="email"]').type('testservis@test.cz');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');

    // Vytvoření nové servisní žádosti
    cy.visit('/bikes');
    cy.contains('Přidat servisní žádost').click();
    cy.get('textarea[name="description"]').type('Testovací servisní požadavek');
    cy.get('button').contains('Odeslat žádost').click();
    cy.contains('Žádost byla úspěšně vytvořena').should('exist');

    // Upload fotky k servisnímu záznamu
    cy.contains('Detail žádosti').click();
    cy.get('input[type="file"]').attachFile('test-foto.jpg');
    cy.contains('Fotka byla úspěšně nahrána').should('exist');

    // Změna stavu žádosti (např. na "v řešení")
    cy.get('select[name="status"]').select('v řešení');
    cy.contains('Stav byl změněn').should('exist');
  });
});
