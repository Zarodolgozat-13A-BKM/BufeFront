describe('admin page', () => {
  const visitWithToken = (path = '/admin') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders admin dashboard sections', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [
        {
          id: 10,
          name: 'Teszt kategoria',
          items: [],
        },
      ],
      orders: [],
    });

    visitWithToken();

    cy.contains('Admin felület').should('be.visible');
    cy.contains('Kategóriák').should('be.visible');
    cy.contains('Termékek').click();
    cy.contains('Termékek (0)').should('be.visible');
    cy.contains('Rendelések').click();
    cy.contains('Rendelések (0)').should('be.visible');
  });

  it('redirects non-admin users to profile page', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
    });

    visitWithToken('/admin');
    cy.url().should('include', '/me');
  });

  it('keeps admin users on /admin route', () => {
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

    visitWithToken('/admin');
    cy.url().should('include', '/admin');
  });

  it('shows category count from mocked data', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [
        { id: 1, name: 'A', items: [] },
        { id: 2, name: 'B', items: [] },
      ],
      orders: [],
    });

    visitWithToken('/admin');
    cy.contains('Kategóriák (2)').should('be.visible');
  });

  it('redirects unauthenticated users to login', () => {
    cy.clearLocalStorage();
    cy.visit('/admin');
    cy.url().should('include', '/login');
  });
});
