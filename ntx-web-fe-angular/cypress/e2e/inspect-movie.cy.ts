import { getBackdrop, getMovieBackdropUrl, getMovieImportUrl, getMoviePosterUrl, getMovieUrl, getPoster } from '@ntx-shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { HUMAN_COGNITIVE_PAUSE } from 'cypress/support/constants';
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
      cy.contains('MOVIE').should('be.visible');
      cy.contains(movie.name).should('be.visible');

      // Assert poster present
      cy.get('img').should('be.visible');
    });
  });

  it('should display missing video and unpublished warning when inspecting a fresh movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);

      cy.contains('Unpublished').should('be.visible');
      cy.contains('Missing video').should('be.visible');
    });
  });

  it('should open options when clicking on options button', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('[name="three_dots_vertical"]').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Edit metadata').should('be.visible');
    });
  });

  it('should display edited movie metadata', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('[name="three_dots_vertical"]').click();
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

      cy.get('button').contains('SAVE').click();

      cy.contains(newMovieName);
      cy.contains(newMovieSummary);
      cy.contains(new Date(newMovieRelease).getFullYear());
    });
  });

  it('should display published movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('.badge').contains('Unpublished').should('be.visible');

      cy.get('[name="three_dots_vertical"]').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Publish').click();
      cy.get('.modal-box').should('be.visible');
      cy.contains('Confirm').click();

      cy.get('.badge').contains('Unpublished').should('not.exist');
    });
  });

  it('should display unpublished movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('[name="three_dots_vertical"]').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Publish').click();
      cy.get('.modal-box').should('be.visible');
      cy.contains('Confirm').click();

      cy.get('.badge').contains('Unpublished').should('not.exist');

      cy.get('[name="three_dots_vertical"]').click();
      cy.contains('Unpublish').click();
      cy.contains('Confirm').click();

      cy.get('.badge').contains('Unpublished').should('be.visible');
    });
  });

  it('should change poster for movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      const PUT_POSTER_REQUEST_TOKEN = 'PUT_POSTER';
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);
      cy.intercept('PUT', `${convertRouteToPath(getMoviePosterUrl(movie.id))}`).as(PUT_POSTER_REQUEST_TOKEN);

      cy.visit(`/inspect/movies/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      cy.get('[name="three_dots_vertical"]').click();
      cy.get('.dropdown-content').should('be.visible');
      cy.contains('Change poster').click();

      cy.get('#posterInput').selectFile('cypress/files/2_sm_284x190.webp', { force: true });
      cy.get('button').contains('Confirm').wait(HUMAN_COGNITIVE_PAUSE).click();

      cy.wait('@' + PUT_POSTER_REQUEST_TOKEN).then((interception) => {
        expect(interception.response!.statusCode).to.eq(200);
        const body = interception.response!.body;
        const newPosterID = body.posterID;
        expect(newPosterID).to.be.a('string');
        expect(newPosterID).to.not.eq(movie.posterID);

        const GET_NEW_POSTER_TOKEN = 'GET_NEW_POSTER';
        cy.intercept(convertRouteToPath(getPoster(newPosterID, PosterSize.L))).as(GET_NEW_POSTER_TOKEN);
        cy.wait('@' + GET_NEW_POSTER_TOKEN).then((interception) => {
          expect(interception.response!.statusCode).to.eq(200);
        });
      });
    });
  });

  it.only('should get backdrop when importing a selected movie', () => {
    cy.importMovie({ name: 'dune: part two' }).then((movie: MovieDTO) => {
      const PUT_BACKDROP_REQUEST_TOKEN = 'PUT_BACKDROP';
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept('PUT', `${convertRouteToPath(getMovieBackdropUrl(movie.id))}`).as(PUT_BACKDROP_REQUEST_TOKEN);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);

      cy.wait('@' + PUT_BACKDROP_REQUEST_TOKEN).then((interception) => {
        expect(interception.response!.statusCode).to.eq(200);
      });
    });
  });
});
