import * as mongoose from 'mongoose';

export const ImportedInformationSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    sourceUUID: { type: String, required: true },
    externalEntityID: { type: String, required: true },
    providedForEntity: { type: String, required: true },
    tag: { type: String, default: '' },
    details: { type: Object, default: null },
  },
  { timestamps: true },
);
