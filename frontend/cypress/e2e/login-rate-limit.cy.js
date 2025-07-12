describe('Rate limiting login', () => {
  it('Zamítne login po překročení limitu pokusů', () => {
    cy.visit('/login');
    for (let i = 0; i < 6; i++) {
      cy.get('input[name="email"]').clear().type('pluks120@gmail.com');
      cy.get('input[name="password"]').clear().type('spatneheslo');
      cy.get('button[type="submit"]').click();
      cy.wait(500); // malá prodleva mezi pokusy
    }
    cy.contains('Příliš mnoho požadavků').should('exist');
  });
});
