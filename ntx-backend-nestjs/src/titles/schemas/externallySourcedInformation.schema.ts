import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import * as mongoose from 'mongoose';

export const ExternallySourcedInformationSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    sourceUUID: { type: String, required: true },
    providedForUUID: { type: mongoose.Schema.Types.UUID, required: true },
    externalEntityId: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);
