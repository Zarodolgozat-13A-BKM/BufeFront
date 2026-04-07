describe('checkout page', () => {
  const visitWithToken = () => {
    cy.visit('/cart', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders checkout shell and empty cart state', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [{ start: '10:00', end: '10:15' }] },
    }).as('getBreaks');

    visitWithToken();
    cy.wait('@getMe');
    cy.wait('@getBreaks');

    cy.contains('Átvétel Kiválasztása').should('be.visible');
    cy.contains('A kosarad jelenleg üres.').should('be.visible');
    cy.contains('Fizetés átvételkor').should('be.visible');
    cy.contains('Bankkártyás fizetés').should('be.visible');
  });

  it('redirects to login when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/cart');
    cy.url().should('include', '/login');
  });

  it('keeps authenticated users on the cart route', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [{ start: '10:00', end: '10:15' }] },
    }).as('getBreaks');

    visitWithToken();
    cy.wait('@getMe');
    cy.url().should('include', '/cart');
  });

  it('opens comment panel when comment section is toggled', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [{ start: '10:00', end: '10:15' }] },
    }).as('getBreaks');

    visitWithToken();
    cy.wait('@getMe');
    cy.contains('Megjegyzés a rendeléshez').click();
    cy.get('#order-comment').should('be.visible');
  });

  it('navigates to main page from empty cart call-to-action', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [{ start: '10:00', end: '10:15' }] },
    }).as('getBreaks');

    visitWithToken();
    cy.wait('@getMe');
    cy.contains('Vissza a menühöz').click();
    cy.url().should('include', '/main');
  });
});
