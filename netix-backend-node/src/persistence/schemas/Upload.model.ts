import mongoose, { Schema, model } from 'mongoose';
import { UploadState } from '../../core/states/UploadState';
import { IMetadataPersistence } from './Metadata.model';
import { IThumbnailPersistence } from './Thumbnail.model';
import { IVideoPersistence } from './Video.model';

export interface IUploadPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  uploaderID: string;
  videoID: string | IVideoPersistence;
  metadataID: string | IMetadataPersistence;
  thumbnailID: string | IThumbnailPersistence;

  ready: boolean;
  state: UploadState;
}

const uploadSchema = new Schema<IUploadPersistence>({
  _id: mongoose.Schema.Types.UUID,
  createdAt: { type: Date, default: () => Date.now(), immutable: true },
  updatedAt: { type: Date, default: () => Date.now() },
  uploaderID: { type: String, default: 'system-user' },
  videoID: { type: mongoose.Schema.Types.UUID, ref: 'Video' },
  metadataID: { type: mongoose.Schema.Types.UUID, ref: 'Metadata' },
  thumbnailID: { type: mongoose.Schema.Types.UUID, ref: 'Thumbnail' },

  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(UploadState), default: UploadState.PENDING },
});

export default model<IUploadPersistence>('Upload', uploadSchema);
