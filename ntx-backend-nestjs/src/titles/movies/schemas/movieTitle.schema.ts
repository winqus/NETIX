import * as mongoose from 'mongoose';
import { MovieTitle } from '../interfaces/movieTitle.interface';

export const MovieTitleSchema = new mongoose.Schema<MovieTitle>({
  runtimeMinutes: { type: Number, required: true },
  video: {
    type: {
      uuid: { type: mongoose.Schema.Types.UUID, ref: 'Video', default: null },
    },
    default: null,
  },
});
