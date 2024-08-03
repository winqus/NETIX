import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import * as mongoose from 'mongoose';
import { EpisodeSchema } from './episode.schema';

export const SeasonSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    seasonNumber: { type: Number, required: true },
    names: [NameSubschema],
    thumbnails: [ThumbnailSchema],
    releaseDate: { type: Date, default: null },
    episodes: [EpisodeSchema],
  },
  { timestamps: true },
);
