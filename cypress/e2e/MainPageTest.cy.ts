describe('main page', () => {
  const mockCategories = [
    {
      id: 1,
      name: 'Szendvicsek',
      items: [
        {
          id: 101,
          name: 'Sajtos szendvics',
          picture_url: 'https://example.com/szendvics.jpg',
          description: 'Friss sajtos szendvics',
          price: 990,
          is_active: true,
          default_time_to_deliver: 5,
          is_featured: true,
          category_id: 1,
          inventory_count: 10,
        },
      ],
    },
    {
      id: 2,
      name: 'Italok',
      items: [
        {
          id: 201,
          name: 'Almale',
          picture_url: 'https://example.com/alma.jpg',
          description: '100% gyumolcsle',
          price: 650,
          is_active: true,
          default_time_to_deliver: 3,
          is_featured: false,
          category_id: 2,
          inventory_count: 8,
        },
      ],
    },
  ];

  beforeEach(() => {

    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMe');

    cy.intercept('GET', '**/categories', {
      statusCode: 200,
      body: mockCategories,
    }).as('getCategories');

    cy.visit('/main', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'mock-token');
      },
    });

    cy.wait('@getMe');
    cy.wait('@getCategories');
  });

  it('renders categories and items from mocked backend', () => {
    cy.get('[data-cy="main-category-name-1"]').should('have.text', 'Szendvicsek');
    cy.get('[data-cy="main-category-name-2"]').should('have.text', 'Italok');
    cy.get('[data-cy="main-item-name-101"]').should('have.text', 'Sajtos szendvics');
    cy.get('[data-cy="main-item-name-201"]').should('have.text', 'Almale');
  });

  it('filters items by search query', () => {
    cy.get('[data-cy="main-search-input"]').type('almale');
    cy.get('[data-cy="main-item-name-201"]').should('have.text', 'Almale');
    cy.get('[data-cy="main-item-name-101"]').should('not.exist');
  });

  it('scrolls to a category section', () => {
    cy.get('[data-cy="main-category-chip-2"]').click();
    cy.get('[data-cy="main-category-section-2"]').scrollIntoView().should('be.visible');
    cy.get('[data-cy="main-category-name-2"]').should('have.text', 'Italok');
  });

  it('marks clicked category chip as active', () => {
    cy.get('[data-cy="main-category-chip-2"]').click();
    cy.get('[data-cy="main-category-chip-2"]').should('have.class', 'bg-primary');
  });

  it('opens the item modal when clicking an item', () => {
    cy.get('[data-cy="main-item-open-101"]').click({ force: true });

    cy.contains('Sajtos szendvics').should('be.visible');
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[data-cy="add-item-confirm"]').should('be.visible');
  });

  it('adds an item to the cart summary', () => {
    cy.get('[data-cy="main-item-open-101"]').click({ force: true });
    cy.get('[data-cy="add-item-confirm"]').click();

    cy.get('[data-cy="main-cart-summary"]').should('contain.text', '1');
    cy.get('[data-cy="main-cart-summary"]').should('contain.text', '990Ft');
  });

  it('shows no-results state for unmatched search', () => {
    cy.get('[data-cy="main-search-input"]').type('nincstalalat123');
    cy.get('[data-cy="main-no-results"]').should('be.visible');
    cy.get('[data-cy="main-no-results"]').should('contain.text', 'Nincs találat erre');
  });

  it('resets search from no-results state', () => {
    cy.get('[data-cy="main-search-input"]').type('nincstalalat123');
    cy.get('[data-cy="main-search-reset"]').click();

    cy.get('[data-cy="main-search-input"]').should('have.value', '');
    cy.get('[data-cy="main-item-name-101"]').should('be.visible');
    cy.get('[data-cy="main-item-name-201"]').should('be.visible');
  });

  it('renders featured section when featured item exists', () => {
    cy.get('[data-cy="main-featured-section"]').should('be.visible');
    cy.get('[data-cy="main-featured-section"]').should('contain.text', 'Napi válogatás');
  });

  it('navigates to cart when cart summary is clicked', () => {
    cy.get('[data-cy="main-item-open-101"]').click({ force: true });
    cy.get('[data-cy="add-item-confirm"]').click();
    cy.get('[data-cy="main-cart-summary"]').click();
    cy.url().should('include', '/cart');
  });
});

describe('main page error states', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
    });
  });

  it('redirects to login when /account/me fails', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('getMeFailed');

    cy.visit('/main');
    cy.wait('@getMeFailed');
    cy.url().should('include', '/login');
  });

  it('redirects to login when /categories fails', () => {
    cy.intercept('GET', '**/account/me', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'teszt.elek',
        full_name: 'Teszt Elek',
        role: 'user',
      },
    }).as('getMeOk');

    cy.intercept('GET', '**/categories', {
      statusCode: 500,
      body: { message: 'Server error' },
    }).as('getCategoriesFailed');

    cy.visit('/main');
    cy.wait('@getMeOk');
    cy.wait('@getCategoriesFailed');
    cy.url().should('include', '/login');
  });
});