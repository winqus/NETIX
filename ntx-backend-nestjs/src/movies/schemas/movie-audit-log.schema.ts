import { Document, Schema } from 'mongoose';

export const MovieAuditLogSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    movieId: { type: String, required: true },
    changes: { type: Object, required: true },
  },
  { timestamps: true },
);

export interface MovieAuditLogDocument extends Document {
  uuid: string;
  event: string;
  movieId: string;
  changes: Record<string, any>;
  createdAt: Date;
}
