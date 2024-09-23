import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { VideoSchema } from './schemas/video.schema';
import { VIDEO_MODEL, VIDEO_SCHEMA_NAME } from './videos.constants';

export const videosProviders = [
  {
    provide: VIDEO_MODEL,
    useFactory: (mongoose: Mongoose) => mongoose.model(VIDEO_SCHEMA_NAME, VideoSchema),
    inject: [DATABASE_CONNECTION],
  },
];
