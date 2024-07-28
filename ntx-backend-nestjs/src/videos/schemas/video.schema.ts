import * as mongoose from 'mongoose';

export const VideoSchema = new mongoose.Schema({
  uuid: mongoose.Schema.Types.UUID,
});
