import { VideoRefSubschema } from '@ntx/titles/schemas/relatedVideo.subschema';
import * as mongoose from 'mongoose';
import { MovieTitle } from '../interfaces/movieTitle.interface';

export const MovieTitleSchema = new mongoose.Schema<MovieTitle>({
  runtimeMinutes: { type: Number, required: true },
  video: VideoRefSubschema,
});
