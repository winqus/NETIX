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

  lengthInSeconds: { type: Number, min: 0 },
  sizeInBytes: { type: Number, min: 0 },
  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(VideoState), default: VideoState.PENDING },
});

export default model<IVideoPersistence>('Video', videoSchema);
