import * as mongoose from 'mongoose';
import { DATABASE_CONNECTION, MONGODB_URI } from './constants';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (): Promise<typeof mongoose> => mongoose.connect(process.env[MONGODB_URI] || '', { autoIndex: true }),
  },
];
