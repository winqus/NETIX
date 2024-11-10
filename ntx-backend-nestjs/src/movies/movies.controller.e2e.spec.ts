import { CacheModule } from '@nestjs/cache-manager';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createRandomValidCreateMovieDTO } from '@ntx-test/movies/utils/random-valid-create-movie-dto.factory';
import { tempLocalStorageOptionsFactory } from '@ntx-test/utils/temp-local-storage-options.factory';
import { TMDBFetchMocker } from '@ntx-test/utils/TMDBFetchResponseMocker';
import { uploadFileWithTUS } from '@ntx-test/utils/upload-file-with-tus';
import { DEFAULT_CONTROLLER_VERSION, GLOBAL_ROUTE_PREFIX, TEST_PORT } from '@ntx/app.constants';
import { delayByMs } from '@ntx/common/utils/delay.utils';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { BACKDROP_CACHE_CONTROL_HEADER_VAL } from '@ntx/images/images.constants';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as request from 'supertest';
import { MovieDTO } from './dto/movie.dto';
import {
  MOVIES_BACKDROP_FILE_FIELD_NAME,
  MOVIES_NO_FILE_PROVIDED_ERROR,
  MOVIES_POSTER_FILE_FIELD_NAME,
} from './movies.constants';
import { MoviesModule } from './movies.module';

jest.setTimeout(10000);

const validTestImagePath = 'test/images/1_sm_284x190.webp';
const validMkvVideoPath = path.resolve('test/videos/500ms-colors_3sec_1280x720_24fps_crf35.mkv');
const tempStoragePath = path.resolve('.temp-test-data');

describe('Movies API (e2e)', () => {
  let app: INestApplication;
  let tmdbFetchMocker: TMDBFetchMocker;

  beforeAll(async () => {
    const { storageType, options } = tempLocalStorageOptionsFactory(tempStoragePath);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: false,
        }),
        DatabaseModule,
        CacheModule.register({ isGlobal: true }),
        ExternalProvidersModule.forRoot({
          TMDB: {
            enable: true,
            apiKey: 'x',
            rateLimitMs: 0,
          },
        }),
        FileStorageModule.forRoot(storageType, options, true),
        JobQueueModule.forRootAsync(),
        MoviesModule,
      ],
    }).compile();

    // fetchMock.dontMock(); // For when using real fetch is necessary
    tmdbFetchMocker = new TMDBFetchMocker();
    tmdbFetchMocker.initialize();
    tmdbFetchMocker.mockResponses();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    // app.useLogger(new _ConsoleLogger()); // For debugging tests
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: DEFAULT_CONTROLLER_VERSION });
    app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);

    await app.init();
    await app.listen(TEST_PORT);
  });

  afterAll(async () => {
    await delayByMs(1000);
    await app?.close();
    await fse.rm(tempStoragePath, { recursive: true, force: true });
    tmdbFetchMocker.dontMockResponses();
  });

  async function createRandomValidMovie(): Promise<MovieDTO> {
    const createMovieDto = createRandomValidCreateMovieDTO();
    const testImagePath = validTestImagePath;

    const response = await request(app.getHttpServer())
      .post('/api/v1/movies')
      .field('name', createMovieDto.name)
      .field('summary', createMovieDto.summary)
      .field('originallyReleasedAt', createMovieDto.originallyReleasedAt.toString())
      .field('runtimeMinutes', createMovieDto.runtimeMinutes)
      .attach(MOVIES_POSTER_FILE_FIELD_NAME, testImagePath);

    expect(response.status).toBe(HttpStatus.CREATED);
    const createdMovie = response.body;

    return createdMovie;
  }

  async function createRandomMovieWithVideo(): Promise<MovieDTO> {
    const existingMovie = await createRandomValidMovie();
    const mkvVideoPath = validMkvVideoPath;

    const uploadEndpoint = `${await app.getUrl()}/api/v1/movies/${existingMovie.id}/video`;
    await uploadFileWithTUS(uploadEndpoint, mkvVideoPath, 'video/x-matroska');
    await delayByMs(100);

    const updatedMovie = await request(app.getHttpServer())
      .get(`/api/v1/movies/${existingMovie.id}`)
      .expect(HttpStatus.OK);

    if (updatedMovie.body.videoID == null) {
      throw new Error('Failed to create movie with video: video ID not set');
    }

    return updatedMovie.body;
  }

  describe('GET /api/v1/movies/:id', () => {
    it('should return 200 when movie exists', async () => {
      const existingMovie = await createRandomValidMovie();

      const response = await request(app.getHttpServer()).get(`/api/v1/movies/${existingMovie.id}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.name).toEqual(existingMovie.name);
    });

    it('should return 404 when movie does not exist', async () => {
      const response = await request(app.getHttpServer()).get(`/api/v1/movies/123456789012345`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /api/v1/movies', () => {
    it('should return a list of movies', async () => {
      const existingMovies = await Promise.all([createRandomValidMovie(), createRandomValidMovie()]);

      const response = await request(app.getHttpServer()).get('/api/v1/movies');

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.map((m: any) => m.id)).toContain(existingMovies[0].id);
      expect(response.body.map((m: any) => m.id)).toContain(existingMovies[1].id);
      expect(Date.parse(response.body[0].originallyReleasedAt)).toBeGreaterThanOrEqual(
        Date.parse(response.body[1].originallyReleasedAt),
      );
    });
  });

  describe('POST /api/v1/movies', () => {
    it('should successfully create a movie with valid input', async () => {
      const createMovieDto = createRandomValidCreateMovieDTO();
      const testImagePath = validTestImagePath;

      const response = await request(app.getHttpServer())
        .post('/api/v1/movies')
        .field('name', createMovieDto.name)
        .field('summary', createMovieDto.summary)
        .field('originallyReleasedAt', createMovieDto.originallyReleasedAt.toString())
        .field('runtimeMinutes', createMovieDto.runtimeMinutes)
        .attach(MOVIES_POSTER_FILE_FIELD_NAME, testImagePath);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response).toBeDefined();
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 when no poster file is provided', async () => {
      const createMovieDto = createRandomValidCreateMovieDTO();

      const response = await request(app.getHttpServer())
        .post('/api/v1/movies')
        .field('name', createMovieDto.name)
        .field('summary', createMovieDto.summary)
        .field('originallyReleasedAt', createMovieDto.originallyReleasedAt.toString())
        .field('runtimeMinutes', createMovieDto.runtimeMinutes);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(MOVIES_NO_FILE_PROVIDED_ERROR);
    });

    it('should return 400 when name is not provided', async () => {
      const createMovieDto = createRandomValidCreateMovieDTO();
      const testImagePath = validTestImagePath;

      const response = await request(app.getHttpServer())
        .post('/api/v1/movies')
        .field('summary', createMovieDto.summary)
        .field('originallyReleasedAt', createMovieDto.originallyReleasedAt.toString())
        .field('runtimeMinutes', createMovieDto.runtimeMinutes)
        .attach(MOVIES_POSTER_FILE_FIELD_NAME, testImagePath);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should fail to create the same movie twice', async () => {
      const createMovieDto = createRandomValidCreateMovieDTO();
      const testImagePath = validTestImagePath;

      const createMovie = async () => {
        return await request(app.getHttpServer())
          .post('/api/v1/movies')
          .field('name', createMovieDto.name)
          .field('summary', createMovieDto.summary)
          .field('originallyReleasedAt', createMovieDto.originallyReleasedAt.toString())
          .field('runtimeMinutes', createMovieDto.runtimeMinutes)
          .attach(MOVIES_POSTER_FILE_FIELD_NAME, testImagePath);
      };

      const firstResponse = await createMovie();
      const secondResponse = await createMovie();

      expect(firstResponse.status).toBe(HttpStatus.CREATED);
      expect(firstResponse.body).toHaveProperty('id');
      expect(secondResponse.status).toBe(HttpStatus.CONFLICT);
      expect(secondResponse.body.message).toMatch('already exists');
    });
  });

  describe('PUT /api/v1/movies/:id/poster', () => {
    it('should successfully update the poster of a movie', async () => {
      const existingMovie = await createRandomValidMovie();
      const testImagePath = validTestImagePath;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/movies/${existingMovie.id}/poster`)
        .attach(MOVIES_POSTER_FILE_FIELD_NAME, testImagePath);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.posterID).toBeDefined();
      expect(response.body.posterID).not.toEqual(existingMovie.posterID);
    });

    it('should return 400 when no poster file is provided', async () => {
      const response = await request(app.getHttpServer()).put(`/api/v1/movies/random-id/poster`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(MOVIES_NO_FILE_PROVIDED_ERROR);
    });
  });

  describe('GET /api/v1/backdrops/:id', () => {
    let backdropID: string;

    beforeAll(async () => {
      const createdMovie = await createRandomValidMovie();

      const testImagePath = validTestImagePath;
      const putBackdropResponse = await request(app.getHttpServer())
        .put(`/api/v1/movies/${createdMovie.id}/backdrop`)
        .attach(MOVIES_BACKDROP_FILE_FIELD_NAME, testImagePath);

      expect(putBackdropResponse.status).toBe(HttpStatus.OK);
      backdropID = putBackdropResponse.body.backdropID;

      await delayByMs(100); /* delay to allow for file processing */
    });

    it('should return the backdrop when it exists', async () => {
      const response = await request(app.getHttpServer()).get(`/api/v1/backdrops/${backdropID}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.headers['content-type']).toBe('image/webp');
      expect(response.body).toBeDefined();
      expect(response.headers['cache-control']).toBe(BACKDROP_CACHE_CONTROL_HEADER_VAL);
    });

    it('should return 404 when the backdrop does not exist', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/backdrops/random-id');

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /api/v1/movies/:id/backdrop', () => {
    it('should successfully update the backdrop of a movie', async () => {
      const existingMovie = await createRandomValidMovie();
      const testImagePath = validTestImagePath;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/movies/${existingMovie.id}/backdrop`)
        .attach(MOVIES_BACKDROP_FILE_FIELD_NAME, testImagePath);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.backdropID).toBeDefined();
      expect(response.body.backdropID).not.toEqual(existingMovie.backdropID);
    });

    it('should return 400 when no backdrop file is provided', async () => {
      const response = await request(app.getHttpServer()).put(`/api/v1/movies/random-id/backdrop`);

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe(MOVIES_NO_FILE_PROVIDED_ERROR);
    });
  });

  describe('PATCH /api/v1/movies/:id', () => {
    it('should successfully update the movie name', async () => {
      const existingMovie = await createRandomValidMovie();
      const newName = 'New name';

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/movies/${existingMovie.id}`)
        .send({ name: newName });

      expect(existingMovie.updatedAt).not.toEqual(response.body.updatedAt);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.name).toEqual(newName);
    });

    it('should return 400 when empty DTO is provided', async () => {
      const existingMovie = await createRandomValidMovie();

      const response = await request(app.getHttpServer()).patch(`/api/v1/movies/${existingMovie.id}`).send({});

      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 when movie does not exist', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/movies/123456789012345`)
        .send({ name: 'New name' });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /api/v1/movies/:id/published', () => {
    it('should successfully set the movie to be published', async () => {
      const existingMovie = await createRandomValidMovie();

      const response = await request(app.getHttpServer()).put(`/api/v1/movies/${existingMovie.id}/published`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.isPublished).toBe(true);
    });

    it('should return 404 when movie does not exist', async () => {
      const response = await request(app.getHttpServer()).put(`/api/v1/movies/123456789012345/published`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/movies/:id/published', () => {
    it('should successfully set the movie to be unpublished', async () => {
      const existingMovie = await createRandomValidMovie();

      const response = await request(app.getHttpServer()).delete(`/api/v1/movies/${existingMovie.id}/published`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body.isPublished).toBe(false);
    });

    it('should return 404 when movie does not exist', async () => {
      const response = await request(app.getHttpServer()).put(`/api/v1/movies/123456789012345/published`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe('TUS UPLOAD to /api/v1/movies/:id/video', () => {
    it('should upload a video for a movie', async () => {
      const existingMovie = await createRandomValidMovie();
      const uploadEndpoint = `${await app.getUrl()}/api/v1/movies/${existingMovie.id}/video`;
      const mkvVideoPath = validMkvVideoPath;

      const uploadResult = await uploadFileWithTUS(uploadEndpoint, mkvVideoPath, 'video/x-matroska');

      expect(uploadResult).toBe('uploaded');
    });

    it('should fail to upload invalid format file', async () => {
      const existingMovie = await createRandomValidMovie();
      const uploadEndpoint = `${await app.getUrl()}/api/v1/movies/${existingMovie.id}/video`;
      const invalidFormatFilePath = path.resolve('test/images/1_sm_284x190.webp');

      const uploadPromise = uploadFileWithTUS(uploadEndpoint, invalidFormatFilePath, 'image/webp');

      expect(uploadPromise).rejects.toThrow();
    });
  });

  describe('DELETE /api/v1/movies/:id', () => {
    it('should successfully delete a movie and the video file', async () => {
      const existingMovie = await createRandomMovieWithVideo();

      const response = await request(app.getHttpServer()).delete(`/api/v1/movies/${existingMovie.id}`);
      const videoFilePath = path.resolve(tempStoragePath, 'videos', `${existingMovie.videoID}`);
      await delayByMs(100); /* delay to allow for file deletion processing */

      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      expect(fse.existsSync(videoFilePath)).toBe(false);
    });

    it('should return 404 when movie does not exist', async () => {
      const response = await request(app.getHttpServer()).delete(`/api/v1/movies/12345-not-existing-id`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
