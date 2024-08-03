import * as mongoose from 'mongoose';
import * as uuid from 'uuid';

export const UUIDSubschema = {
  type: mongoose.Schema.Types.UUID,
  required: true,
  default: () => uuid.v4(),
  immutable: true,
};
