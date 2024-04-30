import mongoose, { Schema, model } from 'mongoose';
import { IMetadataPersistence } from './Metadata.model';
import { IThumbnailPersistence } from './Thumbnail.model';
import { IUploadPersistence } from './Upload.model';
import { IVideoPersistence } from './Video.model';

export type IFullUploadVideoJobPersistance = IUploadVideoJobPersistence & {
  uploadID: IUploadPersistence & { videoID: IVideoPersistence; metadataID: IMetadataPersistence; thumbnailID: IThumbnailPersistence };
};
export interface IUploadVideoJobPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  uploadID: mongoose.Schema.Types.UUID | IUploadPersistence;

  chunks: boolean[];
  chunksReceived: number;
  totalChunkCount: number;
  rawFileSizeInBytes: number;
  originalFileName: string;
  uploadFileProgressPercentage: number;
  uploadFileDone: boolean;
  transcodingProgressPercentage: number;
  transcodingDone: boolean;
  transcodingRate: number;
}

const uploadVideoJobSchema = new Schema<IUploadVideoJobPersistence>({
  _id: mongoose.Schema.Types.UUID,
  createdAt: { type: Date, default: () => Date.now(), immutable: true },
  updatedAt: { type: Date, default: () => Date.now() },
  uploadID: { type: mongoose.Schema.Types.UUID, ref: 'Upload' },

  chunks: { type: [Boolean], required: true },
  chunksReceived: { type: Number, default: 0 },
  totalChunkCount: { type: Number, required: true },
  rawFileSizeInBytes: { type: Number, required: true },
  originalFileName: { type: String, default: '' },
  uploadFileProgressPercentage: { type: Number, default: 0 },
  uploadFileDone: { type: Boolean, default: false },
  transcodingProgressPercentage: { type: Number, default: 0 },
  transcodingDone: { type: Boolean, default: false },
  transcodingRate: { type: Number, default: 0 },
});

export default model<IUploadVideoJobPersistence>('UploadVideoJob', uploadVideoJobSchema);
