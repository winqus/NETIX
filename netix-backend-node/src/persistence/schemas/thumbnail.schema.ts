import { Schema, model } from 'mongoose';

export interface IThumbnailPersistence {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  mimeType: string;
}

export const thumbnailSchema = new Schema<IThumbnailPersistence>({
  uuid: { type: String, required: true, unique: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
});

export default model<IThumbnailPersistence>('Thumbnail', thumbnailSchema);
