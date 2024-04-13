import { Schema, model } from 'mongoose';

export interface IVideoMetadataPersistence {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  mimeType: string;
  title: string;
  description: string;
  durationInSeconds: number;
  sizeInBytes: number;
  originallyPublishedAt: Date;
}

export const videoMetadataSchema = new Schema<IVideoMetadataPersistence>({
  uuid: { type: String, required: true, unique: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  mimeType: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  durationInSeconds: { type: Number, required: true },
  sizeInBytes: { type: Number, required: true },
  originallyPublishedAt: { type: Date, required: true },
});

export default model<IVideoMetadataPersistence>('VideoMetadata', videoMetadataSchema);
