import { cli } from 'cypress';
import { mockAdminSessionInfo } from 'cypress/fixtures/adminSessionInformation.fixtures';
import { mockUserSessionInfo } from 'cypress/fixtures/userSessionInformation.fixtures';

describe('Login spec', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Redirection', () => {
    it('should return to login when trying to go to sessions (AuthGard)', () => {
      // -------------- ACT --------------
      cy.visit('/sessions');

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/login');
    });
  });

  describe('Login as ADMIN', () => {
    it('should login successfully as an ADMIN', () => {
      /// -------------- ARRANGE --------------
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

      // -------------- ACT --------------
      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type(
        `${'test!1234'}{enter}{enter}`
      );

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.get('[data-test="rentals-title"]').should('be.visible');
      cy.get('[data-test="logout-btn"]').should('exist').should('be.visible');

      // -------------- ACT --------------
      // logout
      cy.get('[data-test="logout-btn"]').click();

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/');
      cy.get('[data-test="logout-btn"]').should('not.exist');
    });
  });

  describe('Login as USER', () => {
    it('should login and logout successfully as an USER', () => {
      // -------------- ARRANGE --------------
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

      // -------------- ACT --------------
      cy.get('input[formControlName=email]').type('yoga@studio.com');
      cy.get('input[formControlName=password]').type(
        `${'test!1234'}{enter}{enter}`
      );

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/sessions');
      cy.get('[data-test="create-btn"]').should('not.exist');
      cy.get('[data-test="logout-btn"]').should('be.visible');

      // -------------- ACT --------------
      // logout
      cy.get('[data-test="logout-btn"]').click();

      // -------------- ASSERT --------------
      cy.location('pathname').should('equal', '/');
      cy.get('[data-test="logout-btn"]').should('not.exist');
    });
  });

  describe('Login failure', () => {
    it('should detect an error when login failed', () => {
      /// -------------- ARRANGE --------------
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 404,
        body: {
          message: 'Login failed',
        },
      }).as('loginError');

      // -------------- ACT --------------
      cy.get('[data-test="email"]').type('unknown@email');
      cy.get('[data-test="password"]').type(`${'test!1234'}`);
      cy.get('[data-test="submit-btn"]').click();

      // -------------- ASSERT --------------
      cy.get('[data-test="error"]')
        .should('be.visible')
        .should('have.text', 'An error occurred');
    });

    it('should hide the submit button when login credentials dont respect the requirements', () => {
      // -------------- ARRANGE --------------
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

      // -------------- ACT --------------
      cy.get('[data-test="email"]').type('unknown@'); // wrong email format
      cy.get('[data-test="password"]').type(`${'tes'}`); // password length < 3

      // -------------- ASSERT --------------
      cy.get('[data-test="submit-btn"]').should('be.disabled');
    });
  });
});
