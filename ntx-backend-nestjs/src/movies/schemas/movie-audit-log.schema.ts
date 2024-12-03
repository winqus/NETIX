import { Document, Schema } from 'mongoose';
import { MovieEvent } from '../events/movies.events';

export const MovieAuditLogSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    event: { type: String, enum: Object.values(MovieEvent), required: true },
    movieID: { type: String, required: true },
    changes: { type: Object, required: true },
    userID: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true },
);

export interface MovieAuditLogDocument extends Document {
  uuid: string;
  event: MovieEvent;
  movieID: string;
  changes: Record<string, any>;
  createdAt: Date;
  userID: string;
  username: string;
}
