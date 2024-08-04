import { UUIDSubschema } from '@ntx/common/subschemas/uuid.subschema';
import * as mongoose from 'mongoose';
import { Thumbnail } from '../interfaces/thumbnail.interface';
import { ThumbnailCategory } from '../interfaces/thumbnailCategory.enum';
import { ThumbnailFormat } from '../interfaces/thumbnailFormat.enum';

export const ThumbnailSchema = new mongoose.Schema<Thumbnail>({
  uuid: UUIDSubschema,
  type: {
    type: String,
    enum: Object.values(ThumbnailCategory),
    required: true,
  },
  format: {
    type: String,
    enum: Object.values(ThumbnailFormat),
    required: true,
  },
});
