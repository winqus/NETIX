import { NameCategory } from '@ntx/titles-legacy/interfaces/nameCategory.enum';

export const NameSubschema = {
  type: {
    type: String,
    enum: Object.values(NameCategory),
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: null,
  },
};
