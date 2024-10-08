import { getMovieUrl, getPoster } from '@ntx/app/shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import convertRouteToPath from 'cypress/support/convertRoute';
import { makeRandomMovieName, makeRandomMovieReleaseDate, makeRandomMovieRuntime, makeRandomMovieSummary } from 'cypress/support/randomDataFactory';

const GET_MOVIE_REQUEST_TOKEN = 'GET_MOVIE_REQUEST';
const GET_POSTER_REQUEST_TOKEN = 'GET_POSTER_REQUEST';

describe('inspect movie', () => {
  beforeEach(() => {});

  it('should navigate to the inspect title page', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);

      cy.log('Inspecting movie:', movie);

      cy.url().should('include', `/inspect/movies/${movie.id}`);
    });
  });

  it('should display movie details and poster when going to correct URL', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit('/');
      cy.visit(`/inspect/movies/${movie.id}`);

      cy.log('Inspecting movie:', movie);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      // Assert movie details present
      cy.contains('MOVIE').should('exist');
      cy.contains(movie.name).should('exist');

      // Assert poster present
      cy.get('.relative > .h-full').should('be.visible');
    });
  });

  it('should display missing video and unpublished warning when inspecting a fresh movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);

      cy.contains('Unpublished').should('exist');
      cy.contains('Missing video').should('exist');
    });
  });

  it('should open options when clicking on options button', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('.dropdown > .btn').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Edit metadata').should('exist');
    });
  });

  it('should display edited movie metadata', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('.dropdown > .btn').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Edit metadata').click();
      cy.get('.modal-box').should('be.visible');

      const newMovieName = makeRandomMovieName();
      const newMovieSummary = makeRandomMovieSummary();
      const newMovieRelease = makeRandomMovieReleaseDate();
      const newMovieRuntime = makeRandomMovieRuntime();

      cy.get('#title').clear().type(newMovieName, { delay: 3 });
      cy.get('#summary').clear().type(newMovieSummary, { delay: 3 });
      cy.get('#originallyReleasedAt').clear().type(newMovieRelease, { delay: 3 });
      cy.get('#runtimeMinutes').clear().type(newMovieRuntime.toString(), { delay: 3 });

      cy.get('.btn').contains('SAVE').click();

      cy.get('.text-4xl').and('contain.text', newMovieName);
      cy.get('.flex-grow > .text-xl').and('contain.text', newMovieSummary);
      cy.get('.flex-col > .flex > .text-xl').and('contain.text', new Date(newMovieRelease).getFullYear());
    });
  });
});
