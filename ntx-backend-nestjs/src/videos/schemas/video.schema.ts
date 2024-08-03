import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import * as mongoose from 'mongoose';

export const VideoSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
  },
  { timestamps: true },
);
