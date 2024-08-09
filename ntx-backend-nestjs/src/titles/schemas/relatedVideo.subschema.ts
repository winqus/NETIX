import * as mongoose from 'mongoose';

export const VideoRefSubschema = {
  type: mongoose.Schema.Types.UUID,
  ref: 'Video',
  default: null,
};
