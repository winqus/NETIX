import { DATABASE_CONNECTION } from '@ntx/database/constants';
import { Mongoose } from 'mongoose';
import { ThumbnailSchema } from './schemas/thumbnail.schema';
import { THUMBNAIL_MODEL, THUMBNAIL_SCHEMA_NAME } from './thumbnails.constants';

export const thumbnailsProviders = [
  {
    provide: THUMBNAIL_MODEL,
    useFactory: (mongoose: Mongoose) => mongoose.model(THUMBNAIL_SCHEMA_NAME, ThumbnailSchema),
    inject: [DATABASE_CONNECTION],
  },
];
