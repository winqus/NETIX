import mongoose, { Schema, model } from 'mongoose';
import { MetadataState } from '../../core/states/MetadataState';

export interface IMetadataPersistence {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  title: string;
  publishDatetime: Date;
  ready: boolean;
  state: MetadataState;
}

const metadataSchema = new Schema<IMetadataPersistence>({
  _id: mongoose.Schema.Types.UUID,
  createdAt: { type: Date, default: () => Date.now(), immutable: true },
  updatedAt: { type: Date, default: () => Date.now() },

  title: { type: String },
  publishDatetime: { type: Date },
  ready: { type: Boolean, default: false },
  state: { type: String, enum: Object.values(MetadataState), default: MetadataState.PENDING },
});

export default model<IMetadataPersistence>('Metadata', metadataSchema);
