import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import { VideoSchema } from '@ntx/videos/schemas/video.schema';
import * as mongoose from 'mongoose';

export const EpisodeSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    episodeNumber: { type: Number, required: true },
    names: [NameSubschema],
    runtimeMinutes: { type: Number, required: true },
    thumbnails: [ThumbnailSchema],
    videos: [VideoSchema],
  },
  { timestamps: true },
);
