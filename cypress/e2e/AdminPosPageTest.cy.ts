describe('admin pos page', () => {
  const visitWithToken = (path = '/admin/pos') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders pos layout and supports search filtering', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [
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
      breaks: { breaks: [{ start: '10:00', end: '10:15' }] },
    });

    visitWithToken();

    cy.contains('Admin rendelőfelület').should('be.visible');
    cy.contains('Pénztár').should('be.visible');
    cy.contains('Teszt szendvics').should('be.visible');

    cy.get('input[placeholder="Keresés termékre..."]').type('nincs');
    cy.contains('Nincs találat a keresésre.').should('be.visible');
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

    visitWithToken('/admin/pos');
    cy.url().should('include', '/me');
  });

  it('keeps admin users on /admin/pos route', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [],
      breaks: { breaks: [] },
    });

    visitWithToken('/admin/pos');
    cy.url().should('include', '/admin/pos');
  });

  it('shows empty cart message in checkout panel by default', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [],
      breaks: { breaks: [] },
    });

    visitWithToken('/admin/pos');
    cy.contains('A kosár üres.').should('be.visible');
  });

  it('shows new order reset action button', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      categories: [],
      breaks: { breaks: [] },
    });

    visitWithToken('/admin/pos');
    cy.contains('Új rendelés').should('be.visible');
  });
});
