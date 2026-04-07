describe('checkout page', () => {
  const visitWithToken = () => {
    cy.visit('/cart', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  const mockUserWithBreaks = () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
      breaks: { breaks: [{ start: '10:00', end: '10:15' }] },
    });
  };

  it('renders checkout shell and empty cart state', () => {
    mockUserWithBreaks();

    visitWithToken();

    cy.contains('Átvétel Kiválasztása').should('be.visible');
    cy.contains('A kosarad jelenleg üres.').should('be.visible');
    cy.contains('Fizetés átvételkor').should('be.visible');
    cy.contains('Bankkártyás fizetés').should('be.visible');
  });

  it('redirects to login when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/cart');
    cy.url().should('include', '/login');
  });

  it('keeps authenticated users on the cart route', () => {
    mockUserWithBreaks();

    visitWithToken();
    cy.url().should('include', '/cart');
  });

  it('opens comment panel when comment section is toggled', () => {
    mockUserWithBreaks();

    visitWithToken();
    cy.contains('Megjegyzés a rendeléshez').click();
    cy.get('#order-comment').should('be.visible');
  });

  it('navigates to main page from empty cart call-to-action', () => {
    mockUserWithBreaks();

    visitWithToken();
    cy.contains('Vissza a menühöz').click();
    cy.url().should('include', '/main');
  });
});
