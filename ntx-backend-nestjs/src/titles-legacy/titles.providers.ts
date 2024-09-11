import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { MovieTitleSchema } from './movies/schemas/movieTitle.schema';
import { TitleSchema } from './schemas/title.schema';
import { SeriesTitleSchema } from './series/schemas/seriesTitle.schema';
import { MOVIE_TITLE_MODEL, SERIES_TITLE_MODEL, TITLE_MODEL, TITLE_SCHEMA_NAME } from './titles.constants';

export const titlesProviders = [
  {
    provide: TITLE_MODEL,
    useFactory: (mongoose: Mongoose) => mongoose.model(TITLE_SCHEMA_NAME, TitleSchema),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: MOVIE_TITLE_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model(TITLE_SCHEMA_NAME, TitleSchema).discriminator(TitleType.MOVIE, MovieTitleSchema),
    inject: [DATABASE_CONNECTION],
  },
  {
    provide: SERIES_TITLE_MODEL,
    useFactory: (mongoose: Mongoose) =>
      mongoose.model(TITLE_SCHEMA_NAME, TitleSchema).discriminator(TitleType.SERIES, SeriesTitleSchema),
    inject: [DATABASE_CONNECTION],
  },
];
