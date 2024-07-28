import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import * as mongoose from 'mongoose';
import { VideoCategory } from '../interfaces/videoCategory.enum';

export const VideoSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    type: {
      type: String,
      enum: Object.values(VideoCategory),
      required: true,
    },
  },
  { timestamps: true },
);
