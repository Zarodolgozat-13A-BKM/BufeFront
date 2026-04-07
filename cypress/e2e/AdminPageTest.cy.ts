describe('admin page', () => {
  const visitWithToken = (path = '/admin') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders admin dashboard sections', () => {
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
      body: [
        {
          id: 10,
          name: 'Teszt kategoria',
          items: [],
        },
      ],
    }).as('getCategories');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken();
    cy.wait('@getAdminMe');
    cy.wait('@getCategories');
    cy.wait('@getOrders');

    cy.contains('Admin felület').should('be.visible');
    cy.contains('Kategóriák').should('be.visible');
    cy.contains('Termékek').click();
    cy.contains('Termékek (0)').should('be.visible');
    cy.contains('Rendelések').click();
    cy.contains('Rendelések (0)').should('be.visible');
  });

  it('redirects non-admin users to profile page', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getUserMe');

    cy.intercept('GET', '**/orders/active', {
      statusCode: 200,
      body: [],
    }).as('getActiveOrders');

    visitWithToken('/admin');
    cy.wait('@getUserMe');
    cy.wait('@getActiveOrders');
    cy.url().should('include', '/me');
  });

  it('keeps admin users on /admin route', () => {
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

    visitWithToken('/admin');
    cy.wait('@getAdminMe');
    cy.url().should('include', '/admin');
  });

  it('shows category count from mocked data', () => {
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
      body: [
        { id: 1, name: 'A', items: [] },
        { id: 2, name: 'B', items: [] },
      ],
    }).as('getCategories');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken('/admin');
    cy.wait('@getAdminMe');
    cy.contains('Kategóriák (2)').should('be.visible');
  });

  it('redirects unauthenticated users to login', () => {
    cy.clearLocalStorage();
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });
});
