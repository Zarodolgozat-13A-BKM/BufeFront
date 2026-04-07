describe('profile page', () => {
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
      orders: [],
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
