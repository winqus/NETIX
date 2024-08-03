import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import * as mongoose from 'mongoose';
import { RelatedVideoSubschema } from './relatedVideo.subschema';

export const EpisodeSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    episodeNumber: { type: Number, required: true },
    names: [NameSubschema],
    runtimeMinutes: { type: Number, required: true },
    thumbnails: [ThumbnailSchema],
    videos: [RelatedVideoSubschema],
  },
  { timestamps: true },
);
