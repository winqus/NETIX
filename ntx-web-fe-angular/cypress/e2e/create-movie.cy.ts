import { getMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeLongRandomMovieName, makeRandomMovieReleaseDate, makeRandomMovieRuntime, makeRandomMovieSummary, makeRandomMovieName } from 'cypress/support/randomDataFactory';

describe('create movie', () => {
  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieUrl())).as('BE_CreateMovie');
  });

  it('should navigate to create title page', () => {
    cy.visit('/createTitle');
    cy.url().should('include', '/createTitle');
    cy.contains('Title');
    cy.get('.btn').contains('CREATE').should('be.disabled');
  });

  it('should allow creating with valid fields', () => {
    cy.visit('/createTitle');

    cy.get('#title').type(makeRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('#originallyReleasedAt').type(makeRandomMovieReleaseDate(), { delay: 3 });
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString(), { delay: 3 });

    cy.get('.relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('.btn').contains('CREATE');
  });

  it('should create a movie', () => {
    cy.visit('/createTitle');

    cy.get('#title').type(makeRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('#originallyReleasedAt').type(makeRandomMovieReleaseDate(), { delay: 3 });
    cy.get('#runtimeMinutes').type(makeRandomMovieRuntime().toString(), { delay: 3 });

    cy.get('.relative > .w-full').selectFile('cypress/files/1_sm_284x190.webp');

    cy.get('.btn').contains('CREATE').click();
    cy.wait('@BE_CreateMovie').its('response.statusCode').should('eq', 201);

    cy.url().should('include', '/inspect/movie');
  });

  it('should throw error label', () => {
    cy.visit('/createTitle');

    cy.get('#title').type(makeLongRandomMovieName(), { delay: 3 });
    cy.get('#summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('[for="title"] > .mb-2 > .label-text-alt').should('be.visible').and('contain.text', 'Maximum length is 200');
  });
});
