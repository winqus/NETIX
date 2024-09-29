import { INestApplication } from '@nestjs/common';
import { ConfigFactory } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { loggerMock } from '@ntx-test/utils/logger.utils';
import { GLOBAL_ROUTE_PREFIX } from '@ntx/app.constants';
import { ExternalProvidersModule } from './external-providers.module';
import { ExternalTitleService } from './external-title.service';

jest.setTimeout(10000);

describe('External Title Service (e2e)', () => {
  let app: INestApplication;
  let externalTitleSrv: ExternalTitleService;

  beforeAll(async () => {
    const testConfigurationFactory: ConfigFactory = () => ({});

    Object.assign(process.env, testConfigurationFactory());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ExternalProvidersModule.forRoot()],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(loggerMock);
    // app.useLogger(new ConsoleLogger()); // For debugging tests
    app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);

    await app.init();

    externalTitleSrv = app.get(ExternalTitleService);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('search', () => {
    it('should successfully find a movie', async () => {
      const expectedTitleName = 'Shrek';

      const extTitles = await externalTitleSrv.search({ query: expectedTitleName });

      expect(extTitles).toBeDefined();
      expect(extTitles.size).toBeGreaterThan(0);
    });
  });
});
