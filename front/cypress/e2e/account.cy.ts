describe('Me spec', () => {
  const mockUserSessionInfo = {
    token: 'Bearer',
    type: 'token',
    id: 2,
    username: 'user@email.com',
    firstName: 'user',
    lastName: 'user',
    admin: false,
  };

  const user = {
    id: 2,
    email: 'user@email.com',
    lastName: 'user',
    firstName: 'user',
    admin: false,
    password: 'user',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  describe('ADMIN account', () => {
    const mockAdminSessionInfo = {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'admin@email.com',
      firstName: 'admin',
      lastName: 'admin',
      admin: true,
    };

    const admin = {
      id: 1,
      email: 'admin@email.com',
      lastName: 'admin',
      firstName: 'admin',
      admin: true,
      password: 'admin',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        body: mockAdminSessionInfo,
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        []
      ).as('session');

      // ACT: fill the login form and submit
      cy.get('[data-test="email"]').type(admin.email);
      cy.get('[data-test="password"]').type(admin.password);
      cy.get('[data-test="submit-btn"]').click();

      // ARRANGE : mock http request user
      cy.intercept('GET', `api/user/${admin.id}`, {
        body: admin,
      });

      // Visit the account
      cy.get('[data-test="account"]').click();
    });

    it('should display show admin specific data', () => {});
  });
});
