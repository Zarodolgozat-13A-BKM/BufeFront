describe('payment page', () => {
  const visitWithToken = () => {
    cy.visit('/payment', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });
  };

  const mockUser = () => {
    cy.mockApi({
      me: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    });
  };

  it('shows no active payment state when client secret is missing', () => {
    mockUser();

    visitWithToken();

    cy.contains('Nincs aktív fizetés').should('be.visible');
    cy.contains('Ugrás a kosárhoz').should('have.attr', 'href').and('include', '/cart');
  });

  it('redirects to login when not authenticated', () => {
    cy.clearLocalStorage();
    cy.visit('/payment');
    cy.url().should('include', '/login');
  });

  it('keeps authenticated users on payment route', () => {
    mockUser();

    visitWithToken();
    cy.url().should('include', '/payment');
  });

  it('shows explanation text for missing active payment', () => {
    mockUser();

    visitWithToken();
    cy.contains('Először véglegesítsd a rendelést, hogy elinduljon a fizetés.').should('be.visible');
  });

  it('navigates to cart when inactive payment CTA is clicked', () => {
    mockUser();

    visitWithToken();
    cy.contains('Ugrás a kosárhoz').click();
    cy.url().should('include', '/cart');
  });
});
