import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@ntx/app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { RedisMemoryServer } from 'redis-memory-server';
import * as request from 'supertest';
import createBasicMongoMemoryServer from './utils/createBasicMongoMemoryServer';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let redisServer: RedisMemoryServer;

  beforeAll(async () => {
    mongoServer = await createBasicMongoMemoryServer();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    redisServer = await RedisMemoryServer.create({
      instance: {
        ip: '127.0.0.1',
        port: 6379,
      },
      binary: {
        version: '7.2.4',
      },
    });
    process.env.REDIS_HOST = await redisServer.getHost();
    process.env.REDIS_PORT = (await redisServer.getPort()).toString();
    // process.env.REDIS_PASSWORD = undefined;
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await mongoServer.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});
