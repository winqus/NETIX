import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QUEUE_HOST, QUEUE_PASSWORD, QUEUE_PORT } from '@ntx/app.constants';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { resolve } from 'path';
import RedisMemoryServer from 'redis-memory-server';
import {
  DATABASE_CONNECTION,
  IN_MEMORY_MONGO_PORT,
  IN_MEMORY_REDIS_PORT,
  MONGODB_URI,
  REDIS_CONNECTION_OPTIONS_TOKEN,
  REDIS_DEFAULT_IP,
  REDIS_DEFAULT_PORT,
  REDIS_WINDOWS_BINARY_RELATIVE_PATH,
  USE_MEMORY_MONGO,
  USE_MEMORY_REDIS,
} from './database.constants';
import { RedisConnectionOptions } from './database.types';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (configSrv: ConfigService): Promise<typeof mongoose> => {
      if (configSrv.get(USE_MEMORY_MONGO, false) === 'true') {
        return makeInMemoryMongo(configSrv);
      } else {
        return makeRegularMongo(configSrv);
      }
    },
  },
  {
    provide: REDIS_CONNECTION_OPTIONS_TOKEN,
    inject: [ConfigService],
    useFactory: async (configSrv: ConfigService): Promise<RedisConnectionOptions> => {
      if (configSrv.get(USE_MEMORY_REDIS, false) === 'true') {
        return makeInMemoryRedis(configSrv);
      } else {
        return makeRegularRedis(configSrv);
      }
    },
  },
];

async function makeRegularMongo(configSrv: ConfigService): Promise<typeof mongoose> {
  const mongoURI = configSrv.get(MONGODB_URI) || '';

  return mongoose.connect(mongoURI, { autoIndex: true });
}

async function makeInMemoryMongo(configSrv: ConfigService): Promise<typeof mongoose> {
  let options = undefined;
  const mongodb_port = configSrv.get(IN_MEMORY_MONGO_PORT);
  if (mongodb_port != null) {
    options = { instance: { port: parseInt(mongodb_port, 10) } };
  }

  const mongod = await MongoMemoryServer.create(options);
  const mongoURI = mongod.getUri();

  new Logger('Database Providers').warn(`Using in-memory MongoDB at ${mongoURI}`);

  return mongoose.connect(mongoURI, { autoIndex: true });
}

async function makeRegularRedis(configSrv: ConfigService): Promise<RedisConnectionOptions> {
  const password = configSrv.get(QUEUE_PASSWORD);

  const connection = {
    host: configSrv.get(QUEUE_HOST) || REDIS_DEFAULT_IP,
    port: configSrv.get(QUEUE_PORT) || REDIS_DEFAULT_PORT,
  };

  if (password == null || typeof password != 'string' || password !== '') {
    (connection as any).password = password;
  }

  return { connection };
}

async function makeInMemoryRedis(_configSrv: ConfigService): Promise<RedisConnectionOptions> {
  let binaryOptions = undefined;

  switch (process.platform) {
    case 'win32': {
      const redisBinaryPath = resolve(REDIS_WINDOWS_BINARY_RELATIVE_PATH);

      binaryOptions = {
        systemBinary: redisBinaryPath,
      };

      break;
    }
    case 'linux': {
      binaryOptions = {
        version: '7.2.4',
      };

      break;
    }
    default: {
      throw new Error(`Platform (${process.platform}) not support for in-memory-redis`);
    }
  }

  const redisServer = await RedisMemoryServer.create({
    instance: {
      ip: REDIS_DEFAULT_IP,
      port: undefined /* get a random port */,
    },
    binary: binaryOptions,
  });

  const redisServerHost = await redisServer.getHost();
  const redisServerPort = await redisServer.getPort();

  new Logger('Database Providers').warn(`Using in-memory Redis at ${redisServerHost}:${redisServerPort}`);

  return {
    connection: {
      host: redisServerHost,
      port: redisServerPort,
    },
  };
}
