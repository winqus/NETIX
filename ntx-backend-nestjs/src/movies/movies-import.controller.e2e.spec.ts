import { CacheModule } from '@nestjs/cache-manager';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
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
import { MoviesModule } from './movies.module';

jest.setTimeout(10000);

const tempStoragePath = resolve('.temp-test-data');

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
  });

  afterAll(async () => {
    await fse.rm(tempStoragePath, { recursive: true });
    await app?.close();
    tmdbFetchMocker.dontMockResponses();
  });

  describe('POST /api/v1/movies-import', () => {
    it('should import a movie from an external provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/movies-import')
        .send({ externalProviderID: 'TMDB', externalID: '808' })
        .expect(HttpStatus.CREATED);

      const foundMovie = await request(app.getHttpServer())
        .get(`/api/v1/movies/${response.body.id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toEqual(foundMovie.body.name);
    });

    it('should return 404 when external title not found', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/movies-import')
        .send({ externalProviderID: 'TMDB', externalID: 'non-existing-id-123456789' })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should fail to import same movie twice', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/movies-import')
        .send({ externalProviderID: 'TMDB', externalID: '809' })
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer())
        .post('/api/v1/movies-import')
        .send({ externalProviderID: 'TMDB', externalID: '809' })
        .expect(HttpStatus.CONFLICT);
    });
  });
});
