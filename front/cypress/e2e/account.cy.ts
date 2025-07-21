import { user } from 'cypress/fixtures/user.fixtures';
import { admin } from 'cypress/fixtures/admin.fixtures';
import { mockUserSessionInfo } from 'cypress/fixtures/userSessionInformation.fixtures';
import { mockAdminSessionInfo } from 'cypress/fixtures/adminSessionInformation.fixtures';

describe('Me spec', () => {
  describe('ADMIN account', () => {
    beforeEach(() => {
      // visit login page
      cy.visit('/login');

      // Mock http requests
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

      cy.intercept('GET', `api/user/${admin.id}`, {
        body: admin,
      });

      // fill the login form and submit
      cy.get('[data-test="email"]').type(admin.email);
      cy.get('[data-test="password"]').type(admin.password);
      cy.get('[data-test="submit-btn"]').click();

      // Visit the account
      cy.get('[data-test="account"]').click();
    });

    it('should display admin specific data', () => {
      // -------------- ASSERT --------------
      cy.get('[data-test="account-title"]').should('be.visible');
      cy.get('[data-test="delete-btn"]').should('not.exist');
      cy.get('[data-test="admin"]').should('be.visible');
    });

    it('should navigate to sessions page when back is clicked', () => {
      // -------------- ARRANGE --------------
      cy.get('[data-test="back-btn"]').should('be.visible').click();

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.get('[data-test="rentals-title"]').should('be.visible');
    });
  });

  describe('USER account', () => {
    beforeEach(() => {
      // visit login page
      cy.visit('/login');

      // mock http requests
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

      cy.intercept('GET', `api/user/${user.id}`, {
        body: user,
      });

      // -------------- ACT --------------
      // fill the login form and submit
      cy.get('[data-test="email"]').type(user.email);
      cy.get('[data-test="password"]').type(user.password);
      cy.get('[data-test="submit-btn"]').click();

      // Visit the account
      cy.get('[data-test="account"]').click();
    });

    it('should display user specific data and delete button', () => {
      // -------------- ASSERT --------------
      cy.get('[data-test="account-title"]').should('be.visible');
      cy.get('[data-test="delete-btn"]').should('exist');
      cy.get('[data-test="admin"]').should('not.exist');
    });

    it('should delete a user account and navigate to Home page', () => {
      // -------------- ARRANGE --------------
      cy.intercept(
        {
          method: 'delete',
          url: `/api/user/${mockUserSessionInfo.id}`,
        },
        []
      );

      // -------------- ACT --------------
      cy.get('[data-test="delete-btn"]').click();

      // -------------- ASSERT --------------
      cy.contains('Your account has been deleted !').should('be.visible');
      cy.location('pathname').should('equal', '/');
    });
  });
});
