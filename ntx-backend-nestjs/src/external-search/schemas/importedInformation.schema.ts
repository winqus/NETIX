import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import * as mongoose from 'mongoose';

export const ImportedInformationSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    sourceUUID: { type: String, required: true },
    externalEntityID: { type: String, required: true },
    providedForEntity: UUIDSubschema,
    tag: { type: String, default: '' },
    details: { type: Object, default: null },
  },
  { timestamps: true },
);
