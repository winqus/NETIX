import { Schema, model } from 'mongoose';

export interface IVideoUploadRequestPersistance {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  videoId: string;
  requesterId: string;
  videoState: string;
  thumbnailState: string;
  thumbnailId: string;
  metadataState: string;
  metadataId: string;
  overallState: string;
  chunksReceived: number;
  totalChunks: number;
}

export const videoUploadRequestSchema = new Schema<IVideoUploadRequestPersistance>({
  uuid: { type: String, required: true, unique: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  videoId: { type: String, required: true },
  requesterId: { type: String, required: true },
  videoState: { type: String, required: true },
  thumbnailState: { type: String, required: true },
  thumbnailId: { type: String },
  metadataState: { type: String, required: true },
  metadataId: { type: String },
  overallState: { type: String, required: true },
  chunksReceived: { type: Number, required: true },
  totalChunks: { type: Number, required: true },
});

export default model<IVideoUploadRequestPersistance>('VideoUploadRequest', videoUploadRequestSchema);
