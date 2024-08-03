import { VideoCategory } from '@ntx/videos/interfaces/videoCategory.enum';
import * as mongoose from 'mongoose';

export const RelatedVideoSubschema = {
  uuid: {
    type: mongoose.Schema.Types.UUID,
    ref: 'Video',
    default: null,
  },
  type: {
    type: String,
    enum: Object.values(VideoCategory),
    default: VideoCategory.Primary,
  },
};
