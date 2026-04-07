describe('post payment page', () => {
  const visitWithToken = (path = '/orderstatus') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders user open orders', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [
        {
          id: 31,
          user_id: 1,
          user_username: 'teszt.elek',
          order_identifier_number: 3101,
          status: 'Keszitjuk',
          delivery_date: '2026-04-07T10:00:00',
          total_price: 1500,
          default_completion_time: 15,
          comment: 'teszt',
          items: [
            {
              item_id: 100,
              item_name: 'Teszt szendvics',
              item_price: 1500,
              quantity: 1,
              price: 1500,
              picture_url: null,
            },
          ],
        },
      ],
    }).as('getOrders');

    visitWithToken();
    cy.wait('@getMe');
    cy.wait('@getOrders');

    cy.contains('Nyitott rendeléseid').should('be.visible');
    cy.contains('Rendelésszám:').should('be.visible');
    cy.contains('#3101').should('be.visible');
  });

  it('shows empty state when no open orders exist', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken();
    cy.wait('@getMe');
    cy.wait('@getOrders');

    cy.contains('Jelenleg nincs nyitott rendelés.').should('be.visible');
  });

  it('redirects admin users to /admin/orders from /orderstatus', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
    }).as('getAdminMe');

    cy.intercept('GET', '**/orders/active', {
      statusCode: 200,
      body: [],
    }).as('getActiveOrders');

    cy.intercept('GET', '**/orders/breaks/**', {
      statusCode: 200,
      body: { breaks: [] },
    }).as('getBreaks');

    visitWithToken('/orderstatus');
    cy.wait('@getAdminMe');
    cy.wait('@getActiveOrders');
    cy.wait('@getBreaks');
    cy.url().should('include', '/admin/orders');
  });

  it('keeps regular users on /orderstatus route', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken('/orderstatus');
    cy.wait('@getMe');
    cy.url().should('include', '/orderstatus');
  });

  it('shows refresh action in empty-state card', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/orders', {
      statusCode: 200,
      body: [],
    }).as('getOrders');

    visitWithToken('/orderstatus');
    cy.wait('@getMe');
    cy.contains('Frissítés').should('be.visible');
  });
});
