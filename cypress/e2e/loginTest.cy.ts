describe('login page', () => {
  const usernameInput = '[data-cy="login-username"]';
  const passwordInput = '[data-cy="login-password"]';
  const submitButton = '[data-cy="login-submit"]';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/login');
  });

  it('shows username format validation for incorrect syntax', () => {
    cy.get(usernameInput).type('asdasd');
    cy.get(passwordInput).type('asdasdasdasd');
    cy.get(submitButton).click();
    cy.get('[data-cy="login-username-error"]').should('have.text', 'A felhasználónév formátuma: vezetéknév.keresztnév pl: gipsz.jakab');
  });

  it('logs in successfully with mocked backend', () => {
    cy.intercept('POST', '**/account/login', {
      statusCode: 200,
      body: { access_token: 'mock-token' },
    }).as('loginRequest');

    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        full_name: 'Teszt Elek',
        username: 'teszt.elek',
        role: 'user',
      },
    }).as('meRequest');

    cy.get(usernameInput).type('asdasd.asdasd');
    cy.get(passwordInput).type('asdasdasdasd');
    cy.get(submitButton).click();

    cy.wait('@loginRequest');
    cy.wait('@meRequest');
    cy.url().should('include', '/main');
  });

  it('shows validation when password is missing', () => {
    cy.get(usernameInput).type('asd.asd');
    cy.get(submitButton).click();
    cy.get('input:invalid').should('have.length', 1);
  });

  it('shows validation when username is missing', () => {
    cy.get(passwordInput).type('asd');
    cy.get(submitButton).click();
    cy.get('input:invalid').should('have.length', 1);
  });

  it('shows auth error on 401 response', () => {
    cy.intercept('POST', '**/account/login', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('loginRequest');
    
    cy.get(usernameInput).type('asdasd.asdasd');
    cy.get(passwordInput).type('asdasdasdasd');
    cy.get(submitButton).click();
    
    cy.wait('@loginRequest');
    cy.get('[data-cy="login-error"]').should('have.text', 'Hibás felhasználónév vagy jelszó.');
  });

  it('shows server connection error on network failure', () => {
    cy.intercept('POST', '**/account/login', { forceNetworkError: true }).as('loginRequest');

    cy.get(usernameInput).type('asdasd.asdasd');
    cy.get(passwordInput).type('asdasdasdasd');
    cy.get(submitButton).click();

    cy.wait('@loginRequest');
    cy.get('[data-cy="login-error"]').should('have.text', 'Nem sikerült csatlakozni a szerverhez. Ellenőrizd az internetkapcsolatot vagy próbáld újra később.');
  });

  it('marks both inputs invalid when both are empty', () => {
    cy.get(submitButton).click();
    cy.get('input:invalid').should('have.length', 2);
  });
});