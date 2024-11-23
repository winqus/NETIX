import { Document, Schema } from 'mongoose';

export const AuditLogSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    movieId: { type: String, required: true },
    changes: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export interface AuditLogDocument extends Document {
  uuid: string;
  event: string;
  movieId: string;
  changes: Record<string, any>;
  createdAt: Date;
}
