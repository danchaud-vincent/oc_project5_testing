import { SessionInformation } from '../../src/app/interfaces/sessionInformation.interface';
import { User } from '../../src/app/interfaces/user.interface';

describe('Me spec', () => {
  describe('ADMIN account', () => {
    const mockAdminSessionInfo: SessionInformation = {
      token: 'Bearer',
      type: 'token',
      id: 1,
      username: 'admin@email.com',
      firstName: 'admin',
      lastName: 'admin',
      admin: true,
    };

    const admin: User = {
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

    it('should display show admin specific data', () => {
      // ASSERT
      cy.get('[data-test="account-title"]').should('be.visible');
      cy.get('[data-test="delete-btn"]').should('not.exist');
      cy.get('[data-test="admin"]').should('be.visible');
    });

    it('should navigate to sessions page when back is clicked', () => {
      // ACT
      cy.get('[data-test="back-btn"]').should('be.visible').click();

      // ASSERT
      cy.location('pathname').should('equal', '/sessions');
      cy.get('[data-test="rentals-title"]').should('be.visible');
    });
  });

  describe('USER account', () => {
    const mockUserSessionInfo: SessionInformation = {
      token: 'Bearer',
      type: 'token',
      id: 2,
      username: 'user@email.com',
      firstName: 'user',
      lastName: 'user',
      admin: false,
    };

    const user: User = {
      id: 2,
      email: 'user@email.com',
      lastName: 'user',
      firstName: 'user',
      admin: false,
      password: 'user',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        body: mockUserSessionInfo,
      });

      cy.intercept(
        {
          method: 'GET',
          url: '/api/session',
        },
        []
      ).as('session');

      // ACT: fill the login form and submit
      cy.get('[data-test="email"]').type(user.email);
      cy.get('[data-test="password"]').type(user.password);
      cy.get('[data-test="submit-btn"]').click();

      // ARRANGE : mock http request user
      cy.intercept('GET', `api/user/${user.id}`, {
        body: user,
      });

      // Visit the account
      cy.get('[data-test="account"]').click();
    });

    it('should display user specific data and delete button', () => {
      // ASSERT
      cy.get('[data-test="account-title"]').should('be.visible');
      cy.get('[data-test="delete-btn"]').should('exist');
      cy.get('[data-test="admin"]').should('not.exist');
    });

    it('should delete a user account and navigate to Home page', () => {
      // ARRANGE
      cy.intercept(
        {
          method: 'delete',
          url: `/api/user/${mockUserSessionInfo.id}`,
        },
        []
      );

      // ACT
      cy.get('[data-test="delete-btn"]').click();

      // ASSERT
      cy.contains('Your account has been deleted !').should('be.visible');
      cy.location('pathname').should('equal', '/');
    });
  });
});
