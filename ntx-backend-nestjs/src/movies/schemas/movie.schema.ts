import * as mongoose from 'mongoose';
import { Movie } from '../entities/movie.entity';

export type MovieDocument = Movie & mongoose.Document;

export const MovieSchema = new mongoose.Schema<Movie>(
  {
    uuid: { type: String, required: true },
    posterID: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    originallyReleasedAt: { type: Date, required: true },
    summary: { type: String, required: true },
    runtimeMinutes: { type: Number, required: true },
  },
  { timestamps: true },
);
