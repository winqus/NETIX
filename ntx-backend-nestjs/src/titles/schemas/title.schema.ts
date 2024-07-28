import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ThumbnailFormat } from '@ntx/thumbnails/interfaces/thumbnailFormat.enum';
import * as mongoose from 'mongoose';
import { ThumbnailCategory } from '../../thumbnails/interfaces/thumbnailCategory.enum';
import { VideoCategory } from '../../videos/interfaces/videoCategory.enum';
import { TitleCategory } from '../interfaces/titleCategory.enum';

export const TitleSchema = new mongoose.Schema({
  uuid: {
    type: mongoose.Schema.Types.UUID,
    required: true,
    default: () => new mongoose.Types.UUID(),
  },
  type: {
    type: String,
    enum: Object.values(TitleType),
    required: true,
  },
  titles: [
    {
      type: {
        type: String,
        enum: Object.values(TitleCategory),
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      language: {
        type: String,
        default: null,
      },
    },
  ],
  videos: {
    list: [
      {
        type: {
          type: String,
          enum: Object.values(VideoCategory),
          required: true,
        },
        uuid: {
          type: mongoose.Schema.Types.UUID,
          required: true,
        },
      },
    ],
    default: null,
  },
  thumbnails: {
    list: [
      {
        type: {
          type: String,
          enum: Object.values(ThumbnailCategory),
          required: true,
        },
        uuid: {
          type: mongoose.Schema.Types.UUID,
          required: true,
        },
        format: {
          type: String,
          enum: Object.values(ThumbnailFormat),
          required: true,
        },
      },
    ],
    default: null,
  },
});
