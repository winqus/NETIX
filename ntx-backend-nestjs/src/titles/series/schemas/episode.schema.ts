import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import { VideoRefSubschema } from '@ntx/titles/schemas/relatedVideo.subschema';
import * as mongoose from 'mongoose';
import { Episode } from '../interfaces/episode.interface';

export const EpisodeSchema = new mongoose.Schema<Episode>(
  {
    uuid: UUIDSubschema,
    episodeNumber: { type: Number, required: true },
    names: [NameSubschema],
    runtimeMinutes: { type: Number, required: true },
    thumbnail: { type: ThumbnailSchema, default: null },
    video: VideoRefSubschema,
  },
  { timestamps: true },
);
