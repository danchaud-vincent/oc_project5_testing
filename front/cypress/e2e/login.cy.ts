describe('Login spec', () => {
  const mockSessionInfo = {
    token: '',
    type: '',
    id: 1,
    username: 'username',
    firstName: 'firstname',
    lastName: 'lastName',
  };

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should return to login when trying to go to sessions (AuthGard)', () => {
    cy.visit('/sessions');

    // ASSERT
    cy.location('pathname').should('equal', '/login');
  });

  it('should login successfully as an ADMIN', () => {
    // ARRANGE: mock http request
    cy.intercept('POST', '/api/auth/login', {
      body: {
        ...mockSessionInfo,
        admin: true,
      },
    });

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session');

    // ACT: fill the form
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(
      `${'test!1234'}{enter}{enter}`
    );

    // ASSERT: on sessions page
    cy.location('pathname').should('equal', '/sessions');
    cy.get('[data-test="rentals-title"]').should('be.visible');
  });

  it('should login successfully as an USER', () => {
    // ARRANGE: mock http request
    cy.intercept('POST', '/api/auth/login', {
      body: {
        ...mockSessionInfo,
        admin: false,
      },
    });

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session');

    // ACT: fill the form
    cy.get('input[formControlName=email]').type('yoga@studio.com');
    cy.get('input[formControlName=password]').type(
      `${'test!1234'}{enter}{enter}`
    );

    // ASSERT: on sessions page
    cy.location('pathname').should('equal', '/sessions');
    cy.get('[data-test="create-btn"]').should('not.exist');
  });

  it('should detect an error when login failed', () => {
    // ARRANGE: mock an auth error
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 404,
      body: {
        message: 'Login failed',
      },
    }).as('loginError');

    // ACT: fill the form and submit
    cy.get('[data-test="email"]').type('unknown@email');
    cy.get('[data-test="password"]').type(`${'test!1234'}`);
    cy.get('[data-test="submit-btn"]').click();

    // ASSERT: expect error message
    cy.get('[data-test="error"]')
      .should('be.visible')
      .should('have.text', 'An error occurred');
  });

  it('should hide the submit button when login credentials dont respect the requirements', () => {
    // ARRANGE: mock http request
    cy.intercept('POST', '/api/auth/login', {
      body: {
        ...mockSessionInfo,
        admin: true,
      },
    });

    cy.intercept(
      {
        method: 'GET',
        url: '/api/session',
      },
      []
    ).as('session');

    // ACT: fill the form and submit
    cy.get('[data-test="email"]').type('unknown@'); // wrong email format
    cy.get('[data-test="password"]').type(`${'tes'}`); // password length < 3

    // ASSERT submit button disabled
    cy.get('[data-test="submit-btn"]').should('be.disabled');
  });
});
