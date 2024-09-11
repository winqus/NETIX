import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails-legacy/schemas/thumbnail.schema';
import * as mongoose from 'mongoose';
import { Season } from '../interfaces/season.interface';
import { EpisodeSchema } from './episode.schema';

export const SeasonSchema = new mongoose.Schema<Season>({
  uuid: UUIDSubschema,
  seasonNumber: { type: Number, required: true },
  names: [NameSubschema],
  thumbnail: { type: ThumbnailSchema, default: null },
  releaseDate: { type: Date, default: null },
  episodes: [EpisodeSchema],
});
