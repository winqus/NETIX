import { getMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeLongRandomMovieName, makeRandomMovieReleaseDate, makeRandomMovieRuntime, makeRandomMovieSummary, makeRandomMovieName } from 'cypress/support/randomDataFactory';

describe('create movie', () => {
  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieUrl())).as('BE_CreateMovie');
  });

  it('should navigate to create title page', () => {
    cy.visit('/create/title');
    cy.url().should('include', '/create/title');
    cy.get('[aria-label="Create"]').click();
    cy.contains('Title');
    cy.get('button').contains('CREATE').should('be.disabled');
  });

  it('should allow creating with valid fields', () => {
    cy.visit('/create/title');
    cy.get('[aria-label="Create"]').click();

    cy.get('#title').type(makeRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('#originallyReleasedAt').type(makeRandomMovieReleaseDate(), { delay: 3 });
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString(), { delay: 3 });

    cy.get('.mr-6 > > .relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('button').contains('CREATE');
  });

  it('should create a movie', () => {
    cy.visit('/create/title');
    cy.get('[aria-label="Create"]').click();

    cy.get('#title').type(makeRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('#originallyReleasedAt').type(makeRandomMovieReleaseDate(), { delay: 3 });
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString(), { delay: 3 });

    cy.get('.mr-6 > > .relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('button').contains('CREATE').click();
    cy.wait('@BE_CreateMovie').its('response.statusCode').should('eq', 201);

    cy.url().should('include', '/inspect/movie');
  });

  it('should throw error label', () => {
    cy.visit('/create/title');
    cy.get('[aria-label="Create"]').click();

    cy.get('#title').type(makeLongRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('[for="title"]').contains('Maximum length is 200');
  });
});
