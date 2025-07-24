describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should register successfully', () => {
    // -------------- ARRANGE --------------
    cy.intercept('POST', 'api/auth/register', {
      body: {},
    });

    // -------------- ACT --------------
    cy.get('[data-test="firstName"]').type('username'); // length >= 3
    cy.get('[data-test="lastName"]').type('userLastName'); // length >= 3
    cy.get('[data-test="email"]').type('test@email.com'); //  format ...@...
    cy.get('[data-test="password"]').type('password123'); // length >= 3
    cy.get('[data-test="submit-btn"]').click();

    // -------------- ASSERT --------------
    cy.location('pathname').should('equal', '/login');
    cy.get('[data-test="login-form"]').should('be.visible');
  });

  it('should detect an error when register failed', () => {
    // -------------- ARRANGE --------------
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 404,
      body: {
        message: 'Registration failed',
      },
    });

    /// -------------- ACT --------------
    cy.get('[data-test="firstName"]').type('username');
    cy.get('[data-test="lastName"]').type('userLastName');
    cy.get('[data-test="email"]').type('test@email.com');
    cy.get('[data-test="password"]').type('password123');
    cy.get('[data-test="submit-btn"]').click();

    // -------------- ASSERT --------------
    cy.get('[data-test="error"]')
      .should('be.visible')
      .should('have.text', 'An error occurred');
  });

  it('should hide the submit button when register form inputs are not valid', () => {
    // -------------- ARRANGE --------------
    cy.intercept('POST', '/api/auth/register', {
      body: {},
    });

    // -------------- ACT --------------
    cy.get('[data-test="firstName"]').type('t'); // length < 3
    cy.get('[data-test="lastName"]').type('t'); // length < 3
    cy.get('[data-test="email"]').type('test'); // not format ...@...
    cy.get('[data-test="password"]').type('t'); // length < 3

    // -------------- ASSERT --------------
    cy.get('[data-test="firstName"]').should('have.class', 'ng-invalid');
    cy.get('[data-test="lastName"]').should('have.class', 'ng-invalid');
    cy.get('[data-test="email"]').should('have.class', 'ng-invalid');
    cy.get('[data-test="password"]').should('have.class', 'ng-invalid');
    cy.get('[data-test="submit-btn"]').should('be.disabled');
  });
});
