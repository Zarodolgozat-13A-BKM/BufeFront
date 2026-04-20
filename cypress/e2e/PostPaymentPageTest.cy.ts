describe('post payment page', () => {
  const getTodayAt = (hour: number, minute = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    return `${year}-${month}-${day}T${hh}:${mm}:00`;
  };

  const visitWithToken = (path = '/orderstatus') => {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  it('renders user open orders', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [
        {
          id: 31,
          user_id: 1,
          user_username: 'teszt.elek',
          order_identifier_number: 3101,
          status: 'Keszitjuk',
          delivery_date: getTodayAt(10, 0),
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
    });

    visitWithToken();

    cy.contains('Nyitott rendeléseid').should('be.visible');
    cy.contains('Rendelésszám:').should('be.visible');
    cy.contains('#3101').should('be.visible');
  });

  it('shows empty state when no open orders exist', () => {
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

    cy.contains('Jelenleg nincs nyitott rendelés.').should('be.visible');
  });

  it('renders admin orders view on /orderstatus for admin users', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'admin.user',
        full_name: 'Admin User',
        role: 'admin',
      },
      activeOrders: [],
      breaks: { breaks: [] },
    });

    visitWithToken('/orderstatus');
    cy.url().should('include', '/orderstatus');
    cy.contains('Aktuális rendelések').should('be.visible');
  });

  it('keeps regular users on /orderstatus route', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
    });

    visitWithToken('/orderstatus');
    cy.url().should('include', '/orderstatus');
  });

  it('shows refresh action in empty-state card', () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      activeOrders: [],
    });

    visitWithToken('/orderstatus');
    cy.contains('Frissítés').should('be.visible');
  });
});
