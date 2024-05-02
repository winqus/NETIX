import mongoose, { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { UploadState } from '../../core/states/UploadState';
import { IMetadataPersistence } from './Metadata.model';
import { IThumbnailPersistence } from './Thumbnail.model';
import { IVideoPersistence } from './Video.model';

export interface IUploadPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  uploaderID: string;
  videoID: IVideoPersistence;
  metadataID: IMetadataPersistence;
  thumbnailID: IThumbnailPersistence;

  ready: boolean;
  state: UploadState;
}

type UploadDocument = mongoose.Document & IUploadPersistence;

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

uploadSchema.pre('save', function (next) {
  console.log('>>> Saving Upload Model');
  this.updatedAt = new Date();
  next();
});

uploadSchema.pre('updateOne', function (next) {
  console.log('>>> Updating Upload Model');
  this.updateOne({}, { $set: { updatedAt: new Date() } });
  next();
});

uploadSchema.plugin(mongoosePaginate);

export default model<IUploadPersistence, mongoose.PaginateModel<UploadDocument>>('Upload', uploadSchema);
