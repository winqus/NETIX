import { INestApplication } from '@nestjs/common';
import { ConfigFactory } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { loggerMock } from '@ntx-test/utils/logger.utils';
import { TMDBFetchMocker } from '@ntx-test/utils/TMDBFetchResponseMocker';
import { GLOBAL_ROUTE_PREFIX } from '@ntx/app.constants';
import { ExternalProvidersModule } from './external-providers.module';
import { ExternalTitleService } from './external-title.service';

jest.setTimeout(10000);

describe('External Title Service (e2e)', () => {
  let app: INestApplication;
  let externalTitleSrv: ExternalTitleService;
  let tmdbFetchMocker: TMDBFetchMocker;

  beforeAll(async () => {
    fetchMock.dontMock();

    const testConfigurationFactory: ConfigFactory = () => ({});

    Object.assign(process.env, testConfigurationFactory());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ExternalProvidersModule.forRoot({
          TMDB: {
            enable: true,
            apiKey: 'x',
            rateLimitMs: 10,
          },
        }),
      ],
    }).compile();

    tmdbFetchMocker = new TMDBFetchMocker();
    tmdbFetchMocker.initialize();
    tmdbFetchMocker.mockResponses();

    app = moduleFixture.createNestApplication();
    app.useLogger(loggerMock);
    app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);

    await app.init();

    externalTitleSrv = app.get(ExternalTitleService);
  });

  afterAll(async () => {
    tmdbFetchMocker.dontMockResponses();
    await app?.close();
  });

  describe('search', () => {
    it('should successfully find a movie', async () => {
      const expectedTitleName = 'Shrek';

      const searchResult = await externalTitleSrv.search({ query: 'shrek' });

      expect(searchResult).toBeDefined();
      expect(searchResult.size).toBeGreaterThan(0);
      expect(searchResult.results[0].metadata.name).toBe(expectedTitleName);
    });
  });

  describe('getTitleMetadata', () => {
    it('should successfully find metadata for a movie', async () => {
      const expectedTitleName = 'Shrek';

      const searchResult = await externalTitleSrv.search({ query: 'shrek' });

      expect(searchResult).toBeDefined();
      expect(searchResult.size).toBeGreaterThan(0);
      expect(searchResult.results[0].metadata.name).toBe(expectedTitleName);

      const metadataResult = await externalTitleSrv.getTitleMetadata({
        externalID: searchResult.results[0].externalID,
        providerID: searchResult.results[0].providerID,
        type: searchResult.results[0].type,
      });

      expect(metadataResult).not.toBeNull();
      expect(metadataResult!.metadata.name).toBe(expectedTitleName);
    });
  });
});
