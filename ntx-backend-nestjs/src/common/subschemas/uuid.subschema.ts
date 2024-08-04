import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';

export const UUIDSubschema = {
  type: String,
  default: () => generateUUIDv4(),
};
