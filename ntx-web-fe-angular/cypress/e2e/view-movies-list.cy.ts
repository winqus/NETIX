import { getMovieUrl, getPoster } from '@ntx/app/shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeRandomMovieName } from 'cypress/support/randomDataFactory';
import { yearOnlyRegex } from 'cypress/support/regex';

const GET_MOVIE_REQUEST_TOKEN = 'GET_MOVIE_REQUEST';
const GET_POSTER_REQUEST_TOKEN = 'GET_POSTER_REQUEST';

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

  it('should navigate to view movie page', () => {
    cy.visit('/');
    cy.wait('@BE_GetMovies');
    cy.get('app-movie-card').first().click();
    cy.url().should('include', '/view/movie/MT_');
  });
});
