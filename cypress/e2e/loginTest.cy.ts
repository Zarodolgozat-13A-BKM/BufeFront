describe('try login', () => {
  it('login using a fake account with incorrect username syntax', () => {
    cy.visit("localhost:5173")
    cy.get('#root input.pr-4').type('asdasd');
    cy.get('#root input.pr-10').type('asdasdasdasd');
    cy.get('#root button.w-full').click();
    cy.get('#root div.font-semibold').should('be.visible');
    cy.get('#root div.font-semibold').should('have.text', 'Kérem, adja meg a teljes Jedlikes azonosítóját (pl. Gipsz.Jakab).');
  });

  it('login using a fake account with correct username syntax', () => {
    cy.visit("localhost:5173")
    cy.get('#root input.pr-4').type('asdasd.asdasd');
    cy.get('#root form.space-y-5').click();;
    cy.get('#root input.pr-10').type('asdasdasdasd');
    cy.get('#root button.w-full').click();
    cy.get('#root div.font-semibold').should('be.visible');
    cy.get('#root div.font-semibold').should('have.text', 'Hibás bejelentkezési adatok vagy szerverhiba.');
  })

  it('password input should be invalid if no value is provided', function() {
    cy.visit('localhost:5173')
    cy.get('#root input.pr-4').type('asd');
    cy.get('#root button.w-full').click();
    cy.get('input:invalid').should('have.length', 1);
  });
    it('username input should be invalid if no value is provided', function() {
    cy.visit('localhost:5173')
    cy.get('#root input.pr-10').type('asd');
    cy.get('#root button.w-full').click();
    cy.get('input:invalid').should('have.length', 1);
  });
  it('should show server connection error on network failure', function() {
    cy.visit('localhost:5173')
    cy.get('#root input.pr-4').type('asdasd.asdasd');
    cy.get('#root input.pr-10').type('asdasdasdasd');
    cy.intercept('POST', '**/auth/login', { forceNetworkError: true }).as('loginRequest');
    cy.get('#root button.w-full').click();
    cy.get('#root div.font-semibold').should('have.text', 'Hibás bejelentkezési adatok vagy szerverhiba.');
  })
  it('both username and password inputs should be invalid if no values are provided', function() {
    cy.visit('localhost:5173')
    cy.get('#root button.w-full').click();
    cy.get('input:invalid').should('have.length', 2);
  })
})