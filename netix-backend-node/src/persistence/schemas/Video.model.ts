import mongoose, { Schema, model } from 'mongoose';
import { VideoState } from '../../core/states/VideoState';

export interface IVideoPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  lengthInSeconds: number;
  sizeInBytes: number;
  ready: boolean;
  state: VideoState;
}

const videoSchema = new Schema<IVideoPersistence>({
  _id: mongoose.Schema.Types.UUID,
  createdAt: { type: Date, default: () => Date.now(), immutable: true },
  updatedAt: { type: Date, default: () => Date.now() },

  lengthInSeconds: { type: Number, min: 0, default: 0 },
  sizeInBytes: { type: Number, min: 0, default: 0 },
  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(VideoState), default: VideoState.PENDING },
});

videoSchema.pre('save', function (next) {
  console.log('>>> Saving Video Model');
  this.updatedAt = new Date();
  next();
});

videoSchema.pre('updateOne', function (next) {
  console.log('>>> Updating Video Model');
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});

export default model<IVideoPersistence>('Video', videoSchema);
