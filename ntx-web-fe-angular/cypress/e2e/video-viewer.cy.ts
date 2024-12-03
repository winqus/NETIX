import { getMovieUrl, getVideo, getVideoUpload } from '@ntx-shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { HUMAN_COGNITIVE_PAUSE } from 'cypress/support/constants';
import convertRouteToPath from 'cypress/support/convertRoute';

const GET_MOVIE_REQUEST_TOKEN = 'GET_MOVIE_REQUEST';

describe('video viewer', () => {
  beforeEach(() => {});

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
        cy.contains(videoName).click();
      });

      cy.url().should('include', `/watch/movie/${movie.id}`);
      cy.contains(movie.name);

      cy.contains('00:01').should('be.visible');
      cy.contains('00:02').should('be.visible');
    });
  });
});
