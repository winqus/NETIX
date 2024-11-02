import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { VideoSchema } from './schemas/video.schema';
import { VIDEOS_MODEL_TOKEN, VIDEOS_SCHEMA_NAME } from './videos.constants';

export const videosProviders = [
  {
    provide: VIDEOS_MODEL_TOKEN,
    useFactory: (mongoose: Mongoose) => mongoose.model(VIDEOS_SCHEMA_NAME, VideoSchema),
    inject: [DATABASE_CONNECTION],
  },
];
