describe('admin pos page', () => {
  const visitWithToken = (path = '/admin/pos') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders pos layout and supports search filtering', () => {
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
          id: 1,
          name: 'Szendvicsek',
          items: [
            {
              id: 100,
              name: 'Teszt szendvics',
              price: 990,
              picture_url: null,
              description: 'Teszt',
              is_active: true,
              default_time_to_deliver: 5,
              is_featured: false,
              category_id: 1,
              inventory_count: 6,
            },
          ],
        },
      ],
    }).as('getCategories');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [{ start: '10:00', end: '10:15' }] },
    }).as('getBreaks');

    visitWithToken();
    cy.wait('@getAdminMe');
    cy.wait('@getCategories');
    cy.wait('@getBreaks');

    cy.contains('Admin rendelőfelület').should('be.visible');
    cy.contains('Pénztár').should('be.visible');
    cy.contains('Teszt szendvics').should('be.visible');

    cy.get('input[placeholder="Keresés termékre..."]').type('nincs');
    cy.contains('Nincs találat a keresésre.').should('be.visible');
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

    visitWithToken('/admin/pos');
    cy.wait('@getUserMe');
    cy.wait('@getActiveOrders');
    cy.url().should('include', '/me');
  });

  it('keeps admin users on /admin/pos route', () => {
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

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [] },
    }).as('getBreaks');

    visitWithToken('/admin/pos');
    cy.wait('@getAdminMe');
    cy.url().should('include', '/admin/pos');
  });

  it('shows empty cart message in checkout panel by default', () => {
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

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [] },
    }).as('getBreaks');

    visitWithToken('/admin/pos');
    cy.wait('@getAdminMe');
    cy.contains('A kosár üres.').should('be.visible');
  });

  it('shows new order reset action button', () => {
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

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [] },
    }).as('getBreaks');

    visitWithToken('/admin/pos');
    cy.wait('@getAdminMe');
    cy.contains('Új rendelés').should('be.visible');
  });
});
