// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConsoleLogger, HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createRandomValidCreateMovieDTO } from '@ntx-test/movies/utils/random-valid-create-movie-dto.factory';
import { tempLocalStorageOptionsFactory } from '@ntx-test/utils/temp-local-storage-options.factory';
import { TMDBFetchMocker } from '@ntx-test/utils/TMDBFetchResponseMocker';
import { DEFAULT_CONTROLLER_VERSION, GLOBAL_ROUTE_PREFIX } from '@ntx/app.constants';
import { DatabaseModule } from '@ntx/database/database.module';
import { ExternalProvidersModule } from '@ntx/external-providers/external-providers.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import * as fse from 'fs-extra';
import { resolve } from 'path';
import * as request from 'supertest';
import { MOVIES_NO_FILE_PROVIDED_ERROR, MOVIES_POSTER_FILE_FIELD_NAME } from './movies.constants';
import { MoviesModule } from './movies.module';

jest.setTimeout(10000);

const validTestImagePath = 'test/images/1_sm_284x190.webp';
const tempStoragePath = resolve('.temp-test-data');

describe('Movies API (e2e)', () => {
  let app: INestApplication;
  let tmdbFetchMocker: TMDBFetchMocker;

  beforeAll(async () => {
    const testConfigurationFactory: ConfigFactory = () => ({
      USE_MEMORY_MONGO: 'true',
      IN_MEMORY_MONGO_PORT: 57019,
      USE_MEMORY_REDIS: 'true',
      USE_TEMPORARY_FILE_STORAGE: 'true',
    });

    Object.assign(process.env, testConfigurationFactory());

    const { storageType, options } = tempLocalStorageOptionsFactory(tempStoragePath);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [testConfigurationFactory],
          ignoreEnvFile: true,
        }),
        DatabaseModule,
        ExternalProvidersModule.forRoot({
          TMDB: {
            enable: true,
            apiKey: 'x',
            rateLimitMs: 10,
          },
        }),
        FileStorageModule.forRoot(storageType, options, true),
        JobQueueModule.forRootAsync(),
        MoviesModule,
      ],
    }).compile();

    tmdbFetchMocker = new TMDBFetchMocker();
    tmdbFetchMocker.initialize();
    tmdbFetchMocker.mockResponses();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    // app.useLogger(new ConsoleLogger()); // For debugging tests
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: DEFAULT_CONTROLLER_VERSION });
    app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);

    await app.init();
  });

  afterAll(async () => {
    await fse.rm(tempStoragePath, { recursive: true });
    await app?.close();
    tmdbFetchMocker.dontMockResponses();
  });

  async function createRandomValidMovie() {
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

  describe('PATCH /api/v1/movies/:id', () => {
    it('should successfully update the movie name', async () => {
      const existingMovie = await createRandomValidMovie();
      const newName = 'New name';

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/movies/${existingMovie.id}`)
        .send({ name: newName });

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
});
