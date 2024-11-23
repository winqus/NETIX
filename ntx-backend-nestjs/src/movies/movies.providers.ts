import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { EVENTS_MODEL_TOKEN, MOVIES_MODEL_TOKEN, MOVIES_SCHEMA_NAME } from './movies.constants';
import { MovieSchema } from './schemas/movie.schema';
import { AuditLogSchema } from './schemas/movies.event.schema';

export const moviesProviders = [
  {
    provide: MOVIES_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model(MOVIES_SCHEMA_NAME, MovieSchema),
    inject: [DATABASE_CONNECTION],
  },
];

export const auditLogProviders = [
  {
    provide: EVENTS_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model('AuditLog', AuditLogSchema),
    inject: [DATABASE_CONNECTION],
  },
];
