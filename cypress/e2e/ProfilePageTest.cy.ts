describe('profile page', () => {
  const emptyOrdersPage = {
    data: [],
    links: {
      first: '/api/orders?page=1',
      last: '/api/orders?page=1',
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      links: [
        {
          url: '/api/orders?page=1',
          label: '1',
          active: true,
        },
      ],
      path: '/api/orders',
      per_page: 10,
      to: 0,
      total: 0,
    },
  };

  const visitWithToken = (path = '/me') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders user profile and empty order history state', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
      orders: emptyOrdersPage,
    });

    visitWithToken();

    cy.contains('Profilod').should('be.visible');
    cy.contains('Teszt Elek').should('be.visible');
    cy.contains('Korábbi rendelések').should('be.visible');
    cy.contains('Még nem adtál le rendelést.').should('be.visible');
  });

  it('redirects admin users from /me to /admin', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [],
      orders: emptyOrdersPage,
    });

    visitWithToken('/me');
    cy.url().should('include', '/admin');
  });

  it('keeps normal users on profile route', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
    });

    visitWithToken('/me');
    cy.url().should('include', '/me');
  });

  it('shows zero-order badge when order history is empty', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
    });

    visitWithToken('/me');
    cy.contains('0 db').should('be.visible');
  });

  it('redirects unauthenticated users to login', () => {
    cy.clearLocalStorage();
    cy.visit('/me');
    cy.url().should('include', '/login');
  });
});
