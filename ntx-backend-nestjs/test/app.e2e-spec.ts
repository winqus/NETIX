import { INestApplication } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GLOBAL_ROUTE_PREFIX } from '@ntx/app.constants';
import { AppModule } from '@ntx/app.module';
import * as request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testConfigurationFactory: ConfigFactory = () => ({
      USE_MEMORY_MONGO: 'true',
      USE_MEMORY_REDIS: 'true',
      USE_TEMPORARY_FILE_STORAGE: 'true',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [testConfigurationFactory],
          ignoreEnvFile: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(GLOBAL_ROUTE_PREFIX);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/api').expect(200).expect('Hello World!');
  });
});
