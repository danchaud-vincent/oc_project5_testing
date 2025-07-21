describe('Not found spec', () => {
  beforeEach(() => {
    cy.visit('/404');
  });

  it('should display a not found message', () => {
    cy.contains(/Page not found !/i).should('be.visible');
  });
});
