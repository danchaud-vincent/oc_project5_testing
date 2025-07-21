describe('Not found spec', () => {
  beforeEach(() => {
    cy.visit('/notfoundpage');
  });

  it('should display a not found message', () => {
    cy.contains(/Page not found !/i).should('be.visible');
  });
});
