import { getMovieImporteUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeLongRandomMovieName, makeRandomMovieSummary } from 'cypress/support/randomDataFactory';

describe('create movie', () => {
  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieImporteUrl())).as('BE_ImportMovie');
  });

  it('should navigate to inport title page', () => {
    cy.visit('/createTitle');
    cy.url().should('include', '/createTitle');
    cy.get('[aria-label="Import"]').click();
    cy.contains('Title');
    cy.get('.btn').contains('Import').should('be.disabled');
  });

  it('should allow search for external movies', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const MOVIE_TITLE = 'Shrek';
    cy.get('#searchBar').type(MOVIE_TITLE);

    cy.get('.absolute').should('exist');
    cy.get('.absolute > :nth-child(1) > .flex-col > .font-bold').contains(MOVIE_TITLE);
    cy.get(':nth-child(1) > .flex-col > .text-gray-400').should('exist');
  });

  it('should show error when searching for a non-existent movie', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const title = 'Sh@#$';
    cy.get('#searchBar').type(title);
    cy.get('.input > app-svg-icons > div > span').should('exist');
    cy.get('.absolute').should('exist').contains('No movies found for the given search query.');
    cy.get('.input > app-svg-icons > div > svg').should('exist');
  });

  it('should allow import a selected movie', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const MOVIE_TITLE = 'shrek';
    cy.get('#searchBar').type(MOVIE_TITLE);

    cy.get('.absolute').should('exist');
    cy.get('.absolute > :nth-child(1)').click();

    cy.wait(1000);

    cy.get('.gap-5 > .flex-col.h-full > > .relative > .w-full img').should('be.visible');

    cy.get('.btn').contains('Import').should('be.enabled').click();

    cy.wait('@BE_ImportMovie').then((interception) => {
      const statusCode = interception.response?.statusCode;

      if (statusCode !== 201) {
        cy.get('.text-xs').contains('Movie with these contents already exists').should('be.visible');
      } else {
        cy.wrap(statusCode).should('eq', 201);
        cy.url().should('include', '/inspect/movie');
      }
    });
  });

  it('should throw error label', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const MOVIE_TITLE = 'shrek';
    cy.get('#searchBar').type(MOVIE_TITLE);

    cy.get('.absolute').should('exist');
    cy.get('.absolute > :nth-child(1)').click();

    cy.get('.flex-grow > [for="title"] > #title').type(makeLongRandomMovieName(), { delay: 3 });
    cy.get('.flex-grow > .form-control.h-full > #summary').type(makeRandomMovieSummary(), { delay: 3 });
    cy.get('[for="title"] > .mb-2 > .label-text-alt').should('be.visible').and('contain.text', 'Maximum length is 200');

    cy.get('.btn').contains('Import').should('be.disabled');
  });

  it('should throw search error', () => {
    cy.intercept('GET', '/api/v1/library/search*', { statusCode: 500 });

    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const MOVIE_TITLE = 'shrek';
    cy.get('#searchBar').type(MOVIE_TITLE);

    cy.get('.absolute').should('exist');
    cy.get('.absolute').should('exist').contains('An error occurred while fetching the search results.');
  });

  it('should throw error on fetching a movie', () => {
    cy.intercept('GET', '/api/v1/library/external-movies/808/metadata*', {
      statusCode: 400,
      body: { message: 'Failed to fetch movie from external data source.' },
    }).as('fetchMovieError');

    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const MOVIE_TITLE = 'shrek';
    cy.get('#searchBar').type(MOVIE_TITLE);

    cy.get('.absolute').should('exist');
    cy.get('.absolute > :nth-child(1)').click();

    cy.wait('@fetchMovieError');

    cy.get('.text-xs').contains('Failed to fetch movie from external data source.');
    cy.get('.btn').contains('Import').should('be.disabled');
  });
});
