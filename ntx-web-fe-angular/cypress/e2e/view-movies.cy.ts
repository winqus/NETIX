import { getMovieUrl } from '@ntx/app/shared/config/api-endpoints';
import convertRouteToPath from 'cypress/support/convertRoute';
import { yearOnlyRegex } from 'cypress/support/regex';

describe('view movies list', () => {
  before(() => {
    cy.createMovieWithPoster();
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

  it('should navigate to a movie details page', () => {
    cy.visit('/');
    cy.wait('@BE_GetMovies');
    cy.get('app-movie-card').first().click();
    cy.url().should('include', '/inspect/movies/MT-');
  });
});
