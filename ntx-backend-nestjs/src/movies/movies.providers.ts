import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { EVENTS_MODEL_TOKEN, EVENTS_SCHEMA_NAME, MOVIES_MODEL_TOKEN, MOVIES_SCHEMA_NAME } from './movies.constants';
import { MovieAuditLogSchema } from './schemas/movie-audit-log.schema';
import { MovieSchema } from './schemas/movie.schema';

export const moviesProviders = [
  {
    provide: MOVIES_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model(MOVIES_SCHEMA_NAME, MovieSchema),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: EVENTS_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model(EVENTS_SCHEMA_NAME, MovieAuditLogSchema),
    inject: [DATABASE_CONNECTION],
  },
];
