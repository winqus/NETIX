import { getUploadMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeRandomMovieRuntime, makeRandomMovieSummary, makeRandomMovieTitle } from 'cypress/support/randomDataFactory';

// cy.intercept -- waits for back end response

describe('create movie', () => {
  beforeEach(() => {
    cy.intercept(convertRouteToPath(getUploadMovieUrl())).as('BE_CreateMovie');
  });

  it('shoudl navigate to create title page', () => {
    cy.visit('/createTitle');
    cy.url().should('include', '/createTitle');
    cy.contains('Title');
    cy.get('.btn').contains('CREATE').should('be.disabled');
  });

  it('should allow creating with valid fields', () => {
    cy.visit('/createTitle');

    cy.get('#title').type(makeRandomMovieTitle());
    cy.get('#summary').type(makeRandomMovieSummary());
    cy.get('#originallyReleasedAt').type('2002-09-11');
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString());

    cy.get('.relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('.btn').contains('CREATE');
  });

  it('should create a movie', () => {
    cy.visit('/createTitle');

    cy.get('#title').type(makeRandomMovieTitle());
    cy.get('#summary').type(makeRandomMovieSummary());
    cy.get('#originallyReleasedAt').type('2002-09-11');
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString());

    cy.get('.relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('.btn').contains('CREATE').click();
    cy.wait('@BE_CreateMovie').its('response.statusCode').should('eq', 201);
  });
});
