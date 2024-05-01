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

  mimeType: { type: String, default: '' },
  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(ThumbnailState), default: ThumbnailState.PENDING },
});

thumbnailSchema.pre('save', function (next) {
  console.log('>>> Saving Thumbnail Model');
  this.updatedAt = new Date();
  next();
});

thumbnailSchema.pre('updateOne', function (next) {
  console.log('>>> Updating Thumbnail Model');
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});

export default model<IThumbnailPersistence>('Thumbnail', thumbnailSchema);
