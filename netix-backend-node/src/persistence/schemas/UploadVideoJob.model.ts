import mongoose, { Document, Schema, model } from 'mongoose';
import { IMetadataPersistence } from './Metadata.model';
import { IThumbnailPersistence } from './Thumbnail.model';
import { IUploadPersistence } from './Upload.model';
import { IVideoPersistence } from './Video.model';

export type IFullUploadVideoJobPersistance = IUploadVideoJobPersistence & {
  uploadID: IUploadPersistence & { videoID: IVideoPersistence; metadataID: IMetadataPersistence; thumbnailID: IThumbnailPersistence };
};
export type IFullUploadPersistance = IUploadPersistence & {
  videoID: IVideoPersistence;
  metadataID: IMetadataPersistence;
  thumbnailID: IThumbnailPersistence;
};

export type IFullUploadVideoJobPersistanceDocument = Document &
  IUploadVideoJobPersistence & {
    uploadID: Document &
      IUploadPersistence & {
        videoID: Document & IVideoPersistence;
        metadataID: Document & IMetadataPersistence;
        thumbnailID: Document & IThumbnailPersistence;
      };
  };

export interface IUploadVideoJobPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  uploadID: IUploadPersistence;

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

uploadVideoJobSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  console.log('>>> Saving UploadVideoJob Model');
  next();
});

uploadVideoJobSchema.pre('updateOne', function (next) {
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  console.log('>>> Updating UploadVideoJob Model');
  next();
});

export default model<IUploadVideoJobPersistence>('UploadVideoJob', uploadVideoJobSchema);
