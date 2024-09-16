import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION, IN_MEMORY_MONGO_PORT, MONGODB_URI, USE_MEMORY_MONGO } from './database.constants';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    inject: [ConfigService],
    useFactory: async (configSrv: ConfigService): Promise<typeof mongoose> => {
      let mongoURI: string;

      if (configSrv.get(USE_MEMORY_MONGO) === 'true') {
        // Use in-memory MongoDB
        let options = undefined;
        const mongodb_port = configSrv.get(IN_MEMORY_MONGO_PORT);
        if (mongodb_port != null) {
          options = { instance: { port: parseInt(mongodb_port, 10) } };
        }
        const mongod = await MongoMemoryServer.create(options);
        const uri = mongod.getUri();

        new Logger('Database Providers').warn(`Using in-memory MongoDB at ${uri}`);

        mongoURI = uri;
      } else {
        // Use regular MongoDB URI from config
        mongoURI = configSrv.get(MONGODB_URI) || '';
      }

      return mongoose.connect(mongoURI, { autoIndex: true });
    },
  },
];
