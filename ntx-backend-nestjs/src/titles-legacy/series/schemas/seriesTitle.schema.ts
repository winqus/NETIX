import * as mongoose from 'mongoose';
import { SeriesTitle } from '../interfaces/seriesTitle.interface';
import { SeasonSchema } from './season.schema';

export const SeriesTitleSchema = new mongoose.Schema<SeriesTitle>({
  seasons: {
    default: [],
    type: [SeasonSchema],
  },
});
