import mongoose, { Schema, model } from 'mongoose';

export interface IUploadVideoJobPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  uploadID: string | any;

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
  originalFileName: { type: String },
  uploadFileProgressPercentage: { type: Number, default: 0 },
  uploadFileDone: { type: Boolean, default: false },
  transcodingProgressPercentage: { type: Number, default: 0 },
  transcodingDone: { type: Boolean, default: false },
  transcodingRate: { type: Number, default: 0 },
});

export default model<IUploadVideoJobPersistence>('UploadVideoJob', uploadVideoJobSchema);
