import { Schema, Types, model } from 'mongoose';

export interface IVideoPersistence {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  state: string;
  path: string;
  uploaderId: string;
  thumbnailId: Types.ObjectId;
  metadataId: Types.ObjectId;
}

export const videoSchema = new Schema<IVideoPersistence>({
  uuid: { type: String, required: true, unique: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  state: { type: String, required: true },
  path: { type: String, required: true },
  uploaderId: { type: String, required: true },
  thumbnailId: { type: Schema.Types.ObjectId, required: true },
  metadataId: { type: Schema.Types.ObjectId, required: true },
});

export default model<IVideoPersistence>('Video', videoSchema);
