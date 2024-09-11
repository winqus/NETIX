import { Logger } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION, IN_MEMORY_MONGO_PORT, MONGODB_URI, USE_MEMORY_MONGO } from './database.constants';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async (): Promise<typeof mongoose> => {
      let mongoURI: string;

      if (process.env[USE_MEMORY_MONGO] === 'true') {
        // Use in-memory MongoDB
        let options = undefined;
        if (process.env[IN_MEMORY_MONGO_PORT] != null) {
          options = { instance: { port: parseInt(process.env[IN_MEMORY_MONGO_PORT], 10) } };
        }
        const mongod = await MongoMemoryServer.create(options);
        const uri = mongod.getUri();

        new Logger('Database Providers').warn(`Using in-memory MongoDB at ${uri}`);

        mongoURI = uri;
      } else {
        // Use regular MongoDB URI from config
        mongoURI = process.env[MONGODB_URI] || '';
      }

      return mongoose.connect(mongoURI, { autoIndex: true });
    },
  },
];
