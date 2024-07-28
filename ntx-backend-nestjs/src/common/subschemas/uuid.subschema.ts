import * as mongoose from 'mongoose';

export const UUIDSubschema = {
  type: mongoose.Schema.Types.UUID,
  required: true,
  default: () => new mongoose.Types.UUID(),
};
