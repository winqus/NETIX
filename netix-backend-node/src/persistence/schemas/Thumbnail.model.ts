import mongoose, { Schema, model } from 'mongoose';
import { ThumbnailState } from '../../core/states/ThumbnailState';

export interface IThumbnailPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  mimeType: string;
  ready: boolean;
  state: ThumbnailState;
}

const thumbnailSchema = new Schema<IThumbnailPersistence>({
  _id: mongoose.Schema.Types.UUID,
  createdAt: { type: Date, default: () => Date.now(), immutable: true },
  updatedAt: { type: Date, default: () => Date.now() },

  mimeType: { type: String },
  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(ThumbnailState), default: ThumbnailState.PENDING },
});

export default model<IThumbnailPersistence>('Thumbnail', thumbnailSchema);
