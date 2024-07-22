import { DATABASE_CONNECTION } from '@ntx/database/constants';
import { Mongoose } from 'mongoose';
import { TitleSchema } from './schemas/title.schema';
import { TITLE_MODEL, TITLE_SCHEMA_NAME } from './titles.constants';

export const titlesProviders = [
  {
    provide: TITLE_MODEL,
    useFactory: (mongoose: Mongoose) => mongoose.model(TITLE_SCHEMA_NAME, TitleSchema),
    inject: [DATABASE_CONNECTION],
  },
];
