import * as mongoose from 'mongoose';

export const TitleSchema = new mongoose.Schema({
  uuid: mongoose.Schema.Types.UUID,
});
