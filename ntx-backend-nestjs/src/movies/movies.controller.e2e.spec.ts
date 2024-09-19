import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { tempLocalStorageOptionsFactory } from '@ntx-test/utils/temp-local-storage-options.factory';
import { DEFAULT_CONTROLLER_VERSION, GLOBAL_ROUTE_PREFIX } from '@ntx/app.constants';
import { DatabaseModule } from '@ntx/database/database.module';
import { FileStorageModule } from '@ntx/file-storage/file-storage.module';
import { JobQueueModule } from '@ntx/job-queue/job-queue.module';
import * as fse from 'fs-extra';
import { resolve } from 'path';
import * as request from 'supertest';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MOVIES_NO_FILE_PROVIDED_ERROR, MOVIES_POSTER_FILE_FIELD_NAME } from './movies.constants';
import { MoviesModule } from './movies.module';

const getRandomValidMovieDto = (): CreateMovieDTO => ({
  name: `test-name-${Math.random()}`,
  summary: `short-test-summary-${Math.random()}`,
  originallyReleasedAt: new Date('1999-01-05'),
  runtimeMinutes: 123,
});

const validTestImagePath = 'test/images/1_sm_284x190.webp';
const tempStoragePath = resolve('.temp-test-data');

describe('Movies API (e2e)', () => {
  let app: INestApplication;

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
        FileStorageModule.forRoot(storageType, options, true),
        JobQueueModule.forRootAsync(),
        MoviesModule,
      ],
    }).compile();

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
  });

  describe('POST /api/v1/movies', () => {
    it('should successfully create a movie with valid input', async () => {
      const createMovieDto = getRandomValidMovieDto();
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
      const createMovieDto = getRandomValidMovieDto();

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
      const createMovieDto = getRandomValidMovieDto();
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
      const createMovieDto = getRandomValidMovieDto();
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
});
