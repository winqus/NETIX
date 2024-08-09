import { NameSubschema } from '@ntx/common/subschemas/name.subschema';
import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import { ThumbnailSchema } from '@ntx/thumbnails/schemas/thumbnail.schema';
import * as mongoose from 'mongoose';
import { Title } from '../interfaces/title.interface';

export const TitleSchema = new mongoose.Schema<Title>(
  {
    uuid: UUIDSubschema,
    thumbnail: { type: ThumbnailSchema, default: null },
    names: [NameSubschema],
    releaseDate: Date,
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  },
);
