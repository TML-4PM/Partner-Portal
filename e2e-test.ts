describe('Insights Dashboard', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/insights/*', {
      fixture: 'insights.json'
    }).as('getInsights');

    cy.intercept('GET', '/api/analytics/*', {
      fixture: 'analytics.json'
    }).as('getAnalytics');

    // Visit the insights page
    cy.visit('/partner/test-partner');
  });

  it('displays insights dashboard correctly', () => {
    // Wait for API responses
    cy.wait(['@getInsights', '@getAnalytics']);

    // Check main components are present
    cy.get('[data-testid="insights-header"]').should('be.visible');
    cy.get('[data-testid="insights-list"]').should('exist');
  });

  it('filters insights by severity', () => {
    cy.wait(['@getInsights']);

    // Click on severity filter
    cy.get('[data-testid="severity-filter"]').click();
    cy.get('[data-testid="severity-high"]').click();

    // Verify only high severity insights are shown
    cy.get('[data-testid="insight-card"]').each(($card) => {
      cy.wrap($card).should('have.class', 'bg-red-50');
    });
  });

  it('shows loading state while fetching data', () => {
    cy.intercept('GET', '/api/insights/*', (req) => {
      req.delay(1000).send({ insights: [] });
    }).as('delayedInsights');

    cy.visit('/partner/test-partner');
    cy.get('[data-testid="loading-state"]').should('be.visible');
    cy.wait('@delayedInsights');
    cy.get('[data-testid="loading-state"]').should('not.exist');
  });

  it('handles error states gracefully', () => {
    cy.intercept('GET', '/api/insights/*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('failedRequest');

    cy.visit('/partner/test-partner');
    cy.wait('@failedRequest');
    cy.get('[data-testid="error-message"]').should('be.visible');
  });

  it('allows expanding insight details', () => {
    cy.wait('@getInsights');
    
    // Click on insight card
    cy.get('[data-testid="insight-card"]').first().click();
    
    // Verify expanded content is visible
    cy.get('[data-testid="insight-details"]').should('be.visible');
    cy.get('[data-testid="recommendations-list"]').should('exist');
  });

  it('updates insights in real-time', () => {
    cy.wait('@getInsights');

    // Simulate new insight arrival
    cy.intercept('GET', '/api/insights/*', {
      fixture: 'updated-insights.json'
    }).as('updatedInsights');

    // Trigger refresh
    cy.get('[data-testid="refresh-button"]').click();
    cy.wait('@updatedInsights');

    // Verify new content is displayed
    cy.get('[data-testid="insights-list"]').should('contain', 'New Insight');
  });
});