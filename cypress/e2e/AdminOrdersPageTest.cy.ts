describe('admin orders page', () => {
  const getTodayAt = (hour: number, minute = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${year}-${month}-${day}T${hh}:${mm}:00`;
  };

  const visitWithToken = (path = '/admin/orders') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  const mockAdminMe = () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
    });
  };

  it('renders active orders list for admin', () => {
    mockAdminMe();

    cy.mockApi({
      activeOrders: [
        {
          id: 21,
          user_id: 1,
          user_username: 'teszt.elek',
          order_identifier_number: 2101,
          status: 'Keszitjuk',
          delivery_date: getTodayAt(10, 0),
          total_price: 1200,
          created_at: getTodayAt(9, 45),
          items: [
            {
              item_id: 100,
              item_name: 'Teszt szendvics',
              item_price: 1200,
              quantity: 1,
              price: 1200,
              picture_url: null,
            },
          ],
        },
      ],
      breaks: { breaks: [{ start: '10:00', end: '10:15' }] },
    });

    visitWithToken();
    cy.url().should('include', '/admin/orders');

    cy.contains('Aktuális rendelések').should('be.visible');
    cy.contains('Egész nap').click();
    cy.contains('teszt elek').should('be.visible');
    cy.contains('2101').should('be.visible');
  });

  it('shows no-break message when there are no remaining breaks today', () => {
    mockAdminMe();

    cy.mockApi({
      activeOrders: [],
      breaks: { breaks: [] },
    });

    visitWithToken('/admin/orders');
    cy.contains('Mára nincs több szünet.').should('be.visible');
  });

  it('shows whole-day empty state when there are no active orders', () => {
    mockAdminMe();

    cy.mockApi({
      activeOrders: [],
      breaks: { breaks: [{ start: '10:00', end: '10:15' }] },
    });

    visitWithToken('/admin/orders');
    cy.contains('Egész nap').click();
    cy.contains('Jelenleg nincs aktív rendelés.').should('be.visible');
  });

  it('toggles sort direction button text', () => {
    mockAdminMe();

    cy.mockApi({
      activeOrders: [
        {
          id: 31,
          user_id: 1,
          user_username: 'teszt.elek',
          order_identifier_number: 3101,
          status: 'Keszitjuk',
          delivery_date: getTodayAt(11, 0),
          total_price: 900,
          created_at: getTodayAt(9, 45),
          items: [
            {
              item_id: 100,
              item_name: 'Teszt szendvics',
              item_price: 900,
              quantity: 1,
              price: 900,
              picture_url: null,
            },
          ],
        },
      ],
      breaks: { breaks: [{ start: '10:00', end: '10:15' }] },
    });

    visitWithToken('/admin/orders');

    cy.contains('Csökkenő').should('be.visible').click();
    cy.contains('Növekvő').should('be.visible');
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

    visitWithToken('/admin/orders');
    cy.url().should('include', '/me');
  });
});
