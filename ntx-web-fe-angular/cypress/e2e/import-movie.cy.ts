import { getMovieImporteUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeLongRandomMovieName, makeRandomMovieSummary } from 'cypress/support/randomDataFactory';
import { makeCaseInsensitiveRegex } from 'cypress/support/regex';

describe('create movie', () => {
  const SEARCH_RESULTS_ELEMENT = 'ul';
  const SEARCH_RESULTS_ITEM_ELEMENT = 'li';

  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieImporteUrl())).as('BE_ImportMovie');
  });

  it('should load the import title page with the disabled Import button', () => {
    cy.visit('/createTitle');
    cy.url().should('include', '/createTitle');
    cy.get('[aria-label="Import"]').click();
    cy.contains('Title');
    cy.get('button').contains('Import').should('be.disabled');
  });

  it('should display external movie search results when a movie title is entered', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();
    const movieName = 'Shrek';

    cy.get('#searchBar').type(movieName);
    cy.get(SEARCH_RESULTS_ELEMENT)
      .should('be.visible')
      .within(() => {
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).should('have.length.greaterThan', 0);
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().get('img').should('be.visible');
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().contains(movieName);
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().contains('MOVIE');
      });
  });

  it('should display an error message for a non-existent movie search', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();
    const searchQuery = 'Sh@#$';

    cy.get('#searchBar').type(searchQuery);
    cy.get('.input > [name="throbber"]').should('be.visible');
    cy.contains('No movies found for the given search query.');
    cy.get('.input > [name="search"]').should('be.visible');
  });

  it('should successfully import a selected movie', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();
    const movieName = 'shrek';

    cy.get('#searchBar').type(movieName);
    cy.get(SEARCH_RESULTS_ELEMENT).should('be.visible').get(SEARCH_RESULTS_ITEM_ELEMENT).first().contains(makeCaseInsensitiveRegex(movieName)).click();
    cy.get('img#myImage').should('be.visible');

    cy.get('button').contains('Import').should('be.enabled').click();

    cy.wait('@BE_ImportMovie').then((interception) => {
      const statusCode = interception.response?.statusCode;

      if (statusCode !== 201) {
        /* For test repeatability, need to handle the case where the movie already exists */
        cy.contains('Movie with these contents already exists').should('be.visible');
      } else {
        cy.wrap(statusCode).should('eq', 201);
        cy.url().should('include', '/inspect/movie');
      }
    });
  });

  it('should display a validation error for exceeding maximum movie name length', () => {
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const movieName = 'shrek';
    cy.get('#searchBar').type(movieName);

    cy.get(SEARCH_RESULTS_ELEMENT).should('be.visible').find(SEARCH_RESULTS_ITEM_ELEMENT).first().contains(makeCaseInsensitiveRegex(movieName)).click();

    cy.get('app-import-title').find('input#title').type(makeLongRandomMovieName(), { delay: 2 });
    cy.get('app-import-title').find('textarea#summary').type(makeRandomMovieSummary(), { delay: 2 });
    cy.get('[for="title"]').contains('Maximum length is 200');

    cy.get('button').contains('Import').should('be.disabled');
  });

  it('should display an error message when the search request fails', () => {
    cy.intercept('GET', '/api/v1/library/search*', { statusCode: 500 });
    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const movieName = 'shrek';
    cy.get('#searchBar').type(movieName);

    cy.contains('An error occurred while fetching the search results.');
  });

  it('should display an error message when fetching movie metadata fails', () => {
    cy.intercept('GET', '/api/v1/library/external-movies/808/metadata*', {
      statusCode: 400,
      body: { message: 'Failed to fetch movie from external data source.' },
    }).as('fetchMovieError');

    cy.visit('/createTitle');
    cy.get('[aria-label="Import"]').click();

    const movieName = 'shrek';
    cy.get('#searchBar').type(movieName);

    cy.get(SEARCH_RESULTS_ELEMENT).should('be.visible').find(SEARCH_RESULTS_ITEM_ELEMENT).first().contains(makeCaseInsensitiveRegex(movieName)).click();

    cy.wait('@fetchMovieError');

    cy.contains('Failed to fetch movie from external data source.');
    cy.get('button').contains('Import').should('be.disabled');
  });
});
