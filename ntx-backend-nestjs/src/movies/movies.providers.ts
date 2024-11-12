import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { TusUploadService } from '@ntx/file-storage/tus/tus-upload.service';
import { Mongoose } from 'mongoose';
import {
  MOVIES_MODEL_TOKEN,
  MOVIES_SCHEMA_NAME,
  MOVIES_SERVICE_TOKEN,
  TUS_UPLOAD_SERVICE_TOKEN,
} from './movies.constants';
import { MoviesService } from './movies.service';
import { MovieSchema } from './schemas/movie.schema';

export const moviesProviders = [
  {
    provide: MOVIES_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model(MOVIES_SCHEMA_NAME, MovieSchema),
    inject: [DATABASE_CONNECTION],
  },
  { provide: MOVIES_SERVICE_TOKEN, useClass: MoviesService },
  { provide: TUS_UPLOAD_SERVICE_TOKEN, useClass: TusUploadService },
];
