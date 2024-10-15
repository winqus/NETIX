import { getMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeRandomMovieName } from 'cypress/support/randomDataFactory';
import { yearOnlyRegex } from 'cypress/support/regex';

describe('view movies list', () => {
  const movieName = makeRandomMovieName();
  const SEARCH_RESULTS_ELEMENT = 'ul';
  const SEARCH_RESULTS_ITEM_ELEMENT = 'li';
  before(() => {
    cy.createMovieWithPoster(movieName);
    cy.createMovieWithPoster();
  });

  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieUrl())).as('BE_GetMovies');
  });

  it('should display a list of movies with poster, name, and year', () => {
    cy.visit('/');
    cy.wait('@BE_GetMovies');
    cy.get('app-movie-card').should('have.length.greaterThan', 1);
    cy.get('app-movie-card').each(($card) => {
      cy.wrap($card).find('img').should('be.visible');
      cy.wrap($card).find('.card-title').should('be.visible');
      cy.wrap($card).contains(yearOnlyRegex).should('be.visible');
    });
  });

  it('should navigate to movie inspect page', () => {
    cy.visit('/');
    cy.wait('@BE_GetMovies');
    cy.get('app-movie-card').first().click();
    cy.url().should('include', '/inspect/movies/MT-');
  });

  it('should searched movie navigate to a movie inspect page', () => {
    cy.visit('/');

    cy.get('#searchBar').type(movieName);
    cy.get(SEARCH_RESULTS_ELEMENT)
      .should('be.visible')
      .within(() => {
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).should('have.length.greaterThan', 0);
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().get('img').should('be.visible');
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().contains('MOVIE');
        cy.get(SEARCH_RESULTS_ITEM_ELEMENT).first().contains(movieName).click();
      });
    cy.url().should('include', '/inspect/movies/MT-');
  });
});
