describe('Register spec', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should register successfully', () => {
    // ARRANGE: mock http request
    cy.intercept('POST', 'api/auth/register', {
      body: {},
    });

    // ACT : fill the form with valid inputs
    cy.get('[data-test="firstName"]').type('username'); // length >= 3
    cy.get('[data-test="lastName"]').type('userLastName'); // length >= 3
    cy.get('[data-test="email"]').type('test@email.com'); //  format ...@...
    cy.get('[data-test="password"]').type('password123'); // length >= 3
    cy.get('[data-test="submit-btn"]').click();

    // ASSERT
    cy.location('pathname').should('equal', '/login');
    cy.get('[data-test="login-form"]').should('be.visible');
  });
});
