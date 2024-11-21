import { getMovieUrl, getPoster, getVideo, getVideoUpload } from '@ntx/app/shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import convertRouteToPath from 'cypress/support/convertRoute';
import { HUMAN_COGNITIVE_PAUSE } from 'cypress/support/constants';

const GET_MOVIE_REQUEST_TOKEN = 'GET_MOVIE_REQUEST';
const GET_POSTER_REQUEST_TOKEN = 'GET_POSTER_REQUEST';

describe('view movie', () => {
  before(() => {
    cy.createMovieWithPoster();
    cy.createMovieWithPoster();
  });

  beforeEach(() => {
    cy.intercept(convertRouteToPath(getMovieUrl())).as('BE_GetMovies');
  });

  it('should display movie details and poster when going to correct URL', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl())}/${movie.id}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept(convertRouteToPath(getPoster(movie.posterID, PosterSize.L))).as(GET_POSTER_REQUEST_TOKEN);

      cy.visit(`/view/movie/${movie.id}`);

      cy.log('Viewing movie:', movie);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);
      cy.wait('@' + GET_POSTER_REQUEST_TOKEN);

      // Assert movie details present
      cy.contains('MOVIE').should('be.visible');
      cy.contains(movie.name).should('be.visible');

      cy.contains(new Date(movie.originallyReleasedAt).getFullYear()).should('be.visible');

      let totalSeconds = Math.floor(movie.runtimeMinutes * 60);

      const hours: number = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes: number = Math.floor(totalSeconds / 60);

      let formattedTimeString: string = '';

      if (hours > 0) formattedTimeString += `${hours}h `;

      formattedTimeString += `${minutes}m`;

      cy.contains(formattedTimeString).should('be.visible');

      cy.contains(movie.summary).should('be.visible');

      cy.get('img').should('be.visible');
    });
  });

  it('should see uploaded video for movie', () => {
    cy.createMovieWithPoster().then((movie: MovieDTO) => {
      const UPLOAD_VIDEO_TOKEN = 'UPLOAD_VIDEO_TOKEN';
      const VIDEO_PROPS_TOKEN = 'VIDEO_PROPS_TOKEN';
      cy.intercept('GET', `${convertRouteToPath(getMovieUrl(movie.id))}`).as(GET_MOVIE_REQUEST_TOKEN);
      cy.intercept('POST', `${convertRouteToPath(getVideoUpload(movie.id))}`).as(UPLOAD_VIDEO_TOKEN);
      cy.intercept('GET', new RegExp(`^${convertRouteToPath(getVideo())}/.*`)).as(VIDEO_PROPS_TOKEN);

      cy.visit(`/inspect/movie/${movie.id}`);

      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN);

      cy.contains('Add Video').click();

      cy.get('#videoUploadInput').selectFile('cypress/files/1_video_3sec_1280x720_24fps_crf35.mkv', { force: true });
      cy.get('button').contains('Confirm').wait(HUMAN_COGNITIVE_PAUSE).click();

      cy.wait('@' + UPLOAD_VIDEO_TOKEN).then((interception) => {
        expect(interception.response!.statusCode).to.eq(201);
      });

      let videoID = '';
      cy.wait('@' + GET_MOVIE_REQUEST_TOKEN).then((interception) => {
        expect(interception.response!.statusCode).to.eq(200);
        const body = interception.response!.body;
        videoID = body.videoID;
        expect(videoID).to.be.a('string');
      });

      cy.wait('@' + VIDEO_PROPS_TOKEN).then((interception) => {
        expect(interception.response!.statusCode).to.eq(200);
        const body = interception.response!.body;
        const videoName = body.name;
        expect(videoName).to.be.a('string');  
    });
      cy.visit(`/view/movie/${movie.id}`); 

      cy.contains("Play").click();
      
      cy.url().should('include', `/watch/movie/${movie.id}`);
      cy.contains(movie.name);

      cy.contains('00:01').should('be.visible');
      cy.contains('00:02').should('be.visible');
    });
  });
});
