import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import { VideoSchema } from '@ntx/videos/schemas/video.schema';
import * as mongoose from 'mongoose';
import { SeasonSchema } from './season.schema';

export const MovieDetailsSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    runtimeMinutes: { type: Number, required: true },
    videos: [VideoSchema],
  },
  { timestamps: true },
);

export const SeriesDetailsSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    seasonCount: { type: Number, required: true },
    episodesCount: { type: Number, required: true },
    seasons: [SeasonSchema],
  },
  { timestamps: true },
);

export const TitleSchema = new mongoose.Schema(
  {
    uuid: UUIDSubschema,
    type: {
      type: String,
      enum: Object.values(TitleType),
      required: true,
    },
    thumbnails: [ThumbnailSchema],
    names: [NameSubschema],
    releaseDate: Date,
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: null,
    },
    externalInformationUUID: {
      type: mongoose.Schema.Types.UUID,
      ref: 'ExternallySourcedInformation',
      default: null,
    },
  },
  { timestamps: true },
);
