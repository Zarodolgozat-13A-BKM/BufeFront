describe('profile page', () => {
  const visitWithToken = (path = '/me') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders user profile and empty order history state', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/active', {
      statusCode: 200,
      body: [],
    }).as('getActiveOrders');

    visitWithToken();
    cy.wait('@getMe');
    cy.wait('@getActiveOrders');

    cy.contains('Profilod').should('be.visible');
    cy.contains('Teszt Elek').should('be.visible');
    cy.contains('Korábbi rendelések').should('be.visible');
    cy.contains('Még nem adtál le rendelést.').should('be.visible');
  });

  it('redirects admin users from /me to /admin', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
    }).as('getAdminMe');

    cy.intercept('GET', '**/categories', {
      statusCode: 200,
      body: [],
    }).as('getCategories');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken('/me');
    cy.wait('@getAdminMe');
    cy.wait('@getCategories');
    cy.wait('@getOrders');
    cy.url().should('include', '/admin');
  });

  it('keeps normal users on profile route', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/active', {
      statusCode: 200,
      body: [],
    }).as('getActiveOrders');

    visitWithToken('/me');
    cy.wait('@getMe');
    cy.url().should('include', '/me');
  });

  it('shows zero-order badge when order history is empty', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders/active', {
      statusCode: 200,
      body: [],
    }).as('getActiveOrders');

    visitWithToken('/me');
    cy.wait('@getMe');
    cy.contains('0 db').should('be.visible');
  });

  it('redirects unauthenticated users to login', () => {
    cy.clearLocalStorage();
    cy.visit('/me');
    cy.url().should('include', '/login');
  });
});
